from helpers import db, open_as

DRAFT = {
    "partName": "Bracket Support", "category": "cnc", "subcategory": "CNC Milling", "material": "Aluminium",
    "quantity": 100, "unit": "Nos", "location": "Chennai, Tamil Nadu", "finish": "Anodized", "tolerance": "±0.1mm",
    "specifications": "No sharp edges",
}


def open_review(page, base, draft=DRAFT):
    open_as(page, base, "/none")
    page.evaluate("d => sessionStorage.setItem('jobwork.enquiryDraft', JSON.stringify(d))", draft)
    page.evaluate("location.hash = '#/enquiry/new/review'")
    page.wait_for_selector(".review-rows")


def test_summary_shows_the_draft(page, base):
    open_review(page, base)
    values = page.locator(".review-rows dd").all_inner_texts()
    assert values[:5] == ["Bracket Support", "CNC Machining", "Aluminium", "100 Nos", "Chennai, Tamil Nadu"]
    assert page.inner_text(".review-text") == "Anodized finish, No sharp edges, Tolerance ±0.1mm"


def test_requires_a_draft(page, base):
    open_as(page, base, "/enquiry/new/review")
    page.wait_for_function("location.hash === '#/enquiry/new'")


def test_no_file_is_shown_clearly(page, base):
    open_review(page, base)
    assert page.locator("text=No file attached").is_visible()


def test_back_returns_to_requirements(page, base):
    open_review(page, base)
    page.click(".review-actions .btn-outline")
    page.wait_for_function("location.hash === '#/enquiry/new/requirements'")


def test_submit_creates_the_enquiry_and_clears_the_draft(page, base):
    open_review(page, base)
    page.click("#submit")
    page.wait_for_selector("text=Enquiry Submitted")
    assert "ENQ-1013" in page.inner_text(".sheet-note")
    created = next(e for e in db(page)["enquiries"] if e["id"] == "ENQ-1013")
    assert created["customerId"] == "u-gugan"
    assert created["status"] == "In Progress"
    assert created["date"] == "2025-03-15"
    assert page.evaluate("sessionStorage.getItem('jobwork.enquiryDraft')") is None
    page.click("#view-enquiries")
    page.wait_for_function("location.hash === '#/enquiries'")


def test_verified_vendors_are_notified(page, base):
    open_review(page, base)
    page.click("#submit")
    page.wait_for_selector("text=Enquiry Submitted")
    notes = [n for n in db(page)["notifications"] if n["userId"] == "u-precision"]
    assert notes[-1]["link"] == "/v/enquiries/ENQ-1013"


def test_double_tap_creates_one_enquiry(page, base):
    open_review(page, base)
    page.evaluate("document.getElementById('submit').click(); document.getElementById('submit').click()")
    page.wait_for_selector("text=Enquiry Submitted")
    assert len([e for e in db(page)["enquiries"] if e["partName"] == "Bracket Support" and e["id"] == "ENQ-1013"]) == 1
    assert not any(e["id"] == "ENQ-1014" for e in db(page)["enquiries"])


def test_failed_submit_keeps_the_draft_for_retry(page, base):
    open_review(page, base)
    page.evaluate("localStorage.setItem('jobwork.failNext', '1')")
    page.click("#submit")
    page.wait_for_selector("text=Could not reach JobWork. Please try again.")
    assert page.evaluate("sessionStorage.getItem('jobwork.enquiryDraft')") is not None
    page.click("#submit")
    page.wait_for_selector("text=Enquiry Submitted")


def test_uploaded_file_downloads_from_review(page, base):
    open_as(page, base, "/none")
    page.evaluate("d => sessionStorage.setItem('jobwork.enquiryDraft', JSON.stringify(d))", {**DRAFT, "specifications": ""})
    page.evaluate("location.hash = '#/enquiry/new/requirements'")
    page.wait_for_selector("#form")
    page.set_input_files("#file", {"name": "plate.pdf", "mimeType": "application/pdf", "buffer": b"%PDF-demo"})
    page.wait_for_selector(".drop-file")
    page.click("#next")
    page.wait_for_selector("#open-file")
    with page.expect_download() as download:
        page.click("#open-file")
    assert download.value.suggested_filename == "plate.pdf"


def test_markup_in_the_part_name_is_escaped(page, base):
    open_review(page, base, {**DRAFT, "partName": "<img src=x onerror=alert(1)>"})
    assert page.locator(".review-rows img").count() == 0
