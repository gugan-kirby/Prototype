from helpers import open_as


def open_list(page, base):
    open_as(page, base, "/enquiries")
    page.wait_for_selector(".card")


def titles(page):
    return page.locator(".card-title").all_inner_texts()


def reveal_all(page):
    for _ in range(4):
        page.evaluate("const s = document.getElementById('screen'); s.scrollTop = s.scrollHeight")
        page.wait_for_timeout(60)


def tab(page, index):
    page.click(f"[data-tab='{index}']")


def test_first_view_matches_the_reference(page, base):
    open_list(page, base)
    assert titles(page) == ["Bracket Support", "Base Plate", "Shaft Collar", "L Bracket"]
    assert page.locator(".badge").all_inner_texts() == ["Quoted", "In Progress", "Closed", "Quoted"]
    assert page.locator(".date-line").first.inner_text() == "12 Mar 2025"
    assert page.locator("[data-tab]").all_inner_texts() == ["All (12)", "In Progress (4)", "Quoted (3)", "Closed (5)"]
    assert page.locator(".card-meta").first.inner_text() == "CNC Machining • Aluminium"


def test_scrolling_reveals_every_enquiry(page, base):
    open_list(page, base)
    reveal_all(page)
    assert page.locator(".card").count() == 12


def test_tabs_filter_by_status(page, base):
    open_list(page, base)
    for index, expected, count in ((1, "In Progress", 4), (2, "Quoted", 3), (3, "Closed", 5)):
        tab(page, index)
        reveal_all(page)
        assert set(page.locator(".badge").all_inner_texts()) == {expected}
        assert page.locator(".card").count() == count


def test_search_covers_name_id_category_and_material_across_all_pages(page, base):
    open_list(page, base)
    for query, expected in (("gear", ["Gear Housing"]), ("ENQ-1001", ["Drive Coupling"]), ("brass", ["Spacer Bush"]), ("welding", ["Mounting Frame"])):
        page.fill("#search", query)
        assert titles(page) == expected


def test_search_combines_with_the_tab(page, base):
    open_list(page, base)
    tab(page, 3)
    page.fill("#search", "bracket")
    assert page.locator(".card").count() == 2


def test_no_results_message(page, base):
    open_list(page, base)
    page.fill("#search", "zzzz")
    page.wait_for_selector("text=No results match your search.")


def test_filter_by_category_sort_and_clear(page, base):
    open_list(page, base)
    page.click("#filter")
    page.select_option("#filter-by", "welding")
    page.click("#apply")
    assert titles(page) == ["Mounting Frame"]
    page.click("#filter")
    page.click("#clear")
    assert page.locator(".card").count() == 4
    page.click("#filter")
    page.select_option("#sort", "oldest")
    page.click("#apply")
    assert titles(page)[0] == "Drive Coupling"


def test_card_opens_the_enquiry(page, base):
    open_list(page, base)
    page.click(".card >> nth=0")
    page.wait_for_function("location.hash === '#/enquiries/ENQ-1012'")


def test_new_enquiry_appears_first_with_correct_counts(page, base):
    open_as(page, base, "/none")
    page.evaluate("""d => sessionStorage.setItem('jobwork.enquiryDraft', JSON.stringify(d))""", {
        "partName": "New Part", "category": "welding", "subcategory": "TIG Welding", "material": "SS304",
        "quantity": 5, "unit": "Nos", "location": "Chennai, Tamil Nadu", "finish": "Polished", "tolerance": "±0.2mm", "specifications": "Clean welds",
    })
    page.evaluate("location.hash = '#/enquiry/new/review'")
    page.click("#submit")
    page.click("#view-enquiries")
    page.wait_for_selector(".card")
    assert titles(page)[0] == "New Part"
    assert page.locator("[data-tab='0']").inner_text() == "All (13)"
    assert page.locator("[data-tab='1']").inner_text() == "In Progress (5)"


def test_guest_and_signed_out_are_redirected(page, base):
    page.goto(f"{base}/index.html#/enquiries")
    page.wait_for_function("location.hash === '#/welcome'")
