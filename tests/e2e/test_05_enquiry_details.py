from helpers import open_as


def open_form(page, base, path="/enquiry/new"):
    open_as(page, base, path)
    page.wait_for_selector("#form")


def fill_valid(page):
    page.fill("#partName", "Bracket Support")
    page.select_option("#category", "cnc")
    page.select_option("#subcategory", "CNC Milling")
    page.select_option("#material", "Aluminium")
    page.fill("#quantity", "100")
    page.select_option("#location", "Chennai, Tamil Nadu")


def test_reference_labels_and_defaults(page, base):
    open_form(page, base)
    assert page.locator(".form-label").all_inner_texts() == ["Part / Job Name", "Category", "Sub Category", "Material", "Quantity", "Delivery Location"]
    assert page.input_value("[name=unit]") == "Nos"
    assert page.locator(".step.now span").inner_text() == "Details"


def test_all_fields_are_required(page, base):
    open_form(page, base)
    page.click("#next")
    for message in ("Enter the part or job name.", "Select a category.", "Select a sub category.", "Select a material.", "Enter a whole number above zero.", "Select a delivery location."):
        page.wait_for_selector(f"text={message}")
    assert page.evaluate("location.hash") == "#/enquiry/new"


def test_quantity_must_be_a_positive_whole_number(page, base):
    open_form(page, base)
    fill_valid(page)
    for bad in ("0", "-5", "1.5", "abc"):
        page.fill("#quantity", bad)
        page.click("#next")
        page.wait_for_selector("text=Enter a whole number above zero.")


def test_sub_categories_follow_the_category(page, base):
    open_form(page, base)
    assert page.locator("#subcategory option").count() == 1
    page.select_option("#category", "welding")
    assert "TIG Welding" in page.locator("#subcategory option").all_inner_texts()
    page.select_option("#subcategory", "TIG Welding")
    page.select_option("#category", "vmc")
    assert page.input_value("#subcategory") == ""
    assert "3-Axis VMC" in page.locator("#subcategory option").all_inner_texts()


def test_category_card_preselects_the_category(page, base):
    open_form(page, base, "/enquiry/new?category=welding")
    assert page.input_value("#category") == "welding"
    assert "MIG Welding" in page.locator("#subcategory option").all_inner_texts()


def test_next_saves_the_draft_and_it_is_restored(page, base):
    open_form(page, base)
    fill_valid(page)
    page.select_option("[name=unit]", "Kg")
    page.click("#next")
    page.wait_for_function("location.hash === '#/enquiry/new/requirements'")
    page.evaluate("location.hash = '#/enquiry/new'")
    page.wait_for_selector("#form")
    assert page.input_value("#partName") == "Bracket Support"
    assert page.input_value("#subcategory") == "CNC Milling"
    assert page.input_value("#quantity") == "100"
    assert page.input_value("[name=unit]") == "Kg"


def test_signed_out_and_guest_cannot_open_it(page, base):
    page.goto(f"{base}/index.html#/enquiry/new")
    page.wait_for_function("location.hash === '#/welcome'")
    open_as(page, base, "/enquiry/new", '{"guest":true,"role":"customer"}')
    page.wait_for_function("location.hash === '#/home'")


def test_markup_in_a_restored_draft_is_escaped(page, base):
    open_form(page, base)
    fill_valid(page)
    page.fill("#partName", '"><img src=x onerror=alert(1)>')
    page.click("#next")
    page.wait_for_function("location.hash === '#/enquiry/new/requirements'")
    page.evaluate("location.hash = '#/enquiry/new'")
    page.wait_for_selector("#form")
    assert page.locator(".enquiry-form img").count() == 0
    assert page.input_value("#partName").startswith('">')
