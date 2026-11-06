from helpers import open_as

DRAFT = {"partName": "Bracket Support", "category": "cnc", "subcategory": "CNC Milling", "material": "Aluminium", "quantity": 100, "unit": "Nos", "location": "Chennai, Tamil Nadu"}


def open_step(page, base):
    open_as(page, base, "/none")
    page.evaluate("d => sessionStorage.setItem('jobwork.enquiryDraft', JSON.stringify(d))", DRAFT)
    page.evaluate("location.hash = '#/enquiry/new/requirements'")
    page.wait_for_selector("#form")


def upload(page, name, size=2048, mime="application/pdf"):
    page.set_input_files("#file", {"name": name, "mimeType": mime, "buffer": b"x" * size})


def draft(page):
    return page.evaluate("JSON.parse(sessionStorage.getItem('jobwork.enquiryDraft'))")


def complete(page):
    page.select_option("#finish", "Anodized")
    page.select_option("#tolerance", "±0.1mm")


def test_reference_content(page, base):
    open_step(page, base)
    assert page.locator(".step.now span").inner_text() == "Requirements"
    assert page.locator(".drop strong").inner_text() == "Upload File"
    assert page.locator(".drop span").inner_text() == "PDF, DWG, STEP, JPG (Max 10MB)"


def test_requires_details_first(page, base):
    open_as(page, base, "/enquiry/new/requirements")
    page.wait_for_function("location.hash === '#/enquiry/new'")


def test_every_supported_type_uploads(page, base):
    open_step(page, base)
    for name in ("a.pdf", "b.dwg", "c.step", "d.stp", "e.jpg", "f.JPEG"):
        upload(page, name)
        page.wait_for_selector(f".drop-file strong:has-text('{name}')")


def test_unsupported_type_is_rejected(page, base):
    open_step(page, base)
    upload(page, "virus.exe")
    page.wait_for_selector("text=Upload a PDF, DWG, STEP or JPG file.")
    assert draft(page).get("drawing") is None


def test_oversized_and_empty_files_are_rejected(page, base):
    open_step(page, base)
    upload(page, "big.pdf", 10 * 1024 * 1024 + 1)
    page.wait_for_selector("text=File is larger than 10MB.")
    upload(page, "empty.pdf", 0)
    page.wait_for_selector("text=This file is empty.")


def test_a_file_at_the_limit_is_accepted_and_really_stored(page, base):
    open_step(page, base)
    upload(page, "limit.pdf", 10 * 1024 * 1024)
    page.wait_for_selector(".drop-file strong:has-text('limit.pdf')", timeout=10000)
    stored = page.evaluate("""async () => {
      const { getFile } = await import('/js/core/files.js');
      const file = await getFile(JSON.parse(sessionStorage.getItem('jobwork.enquiryDraft')).drawing.id);
      return file.size;
    }""")
    assert stored == 10 * 1024 * 1024


def test_replacing_and_removing_a_file(page, base):
    open_step(page, base)
    upload(page, "first.pdf")
    page.wait_for_selector(".drop-file strong:has-text('first.pdf')")
    upload(page, "second.pdf")
    page.wait_for_selector(".drop-file strong:has-text('second.pdf')")
    page.click("#remove")
    page.wait_for_selector(".drop strong:has-text('Upload File')")
    assert draft(page).get("drawing") is None


def test_typed_text_survives_an_upload(page, base):
    open_step(page, base)
    page.fill("#specifications", "No sharp edges")
    page.select_option("#finish", "Anodized")
    upload(page, "a.pdf")
    page.wait_for_selector(".drop-file")
    assert page.input_value("#specifications") == "No sharp edges"
    assert page.input_value("#finish") == "Anodized"


def test_needs_a_drawing_or_specifications_and_both_dropdowns(page, base):
    open_step(page, base)
    page.click("#next")
    for message in ("Upload a drawing or enter specifications.", "Select a surface finish.", "Select a tolerance."):
        page.wait_for_selector(f"text={message}")
    assert page.evaluate("location.hash") == "#/enquiry/new/requirements"


def test_specifications_alone_are_enough(page, base):
    open_step(page, base)
    page.fill("#specifications", "Anodized finish, No sharp edges")
    complete(page)
    page.click("#next")
    page.wait_for_function("location.hash === '#/enquiry/new/review'")
    assert draft(page)["specifications"] == "Anodized finish, No sharp edges"


def test_back_returns_to_details_with_the_draft(page, base):
    open_step(page, base)
    page.click(".btn-pair .btn-outline")
    page.wait_for_selector("#partName")
    assert page.input_value("#partName") == "Bracket Support"
