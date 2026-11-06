from helpers import open_as


def open_home(page, base):
    open_as(page, base, "/home")
    page.wait_for_selector(".home")


def test_content_matches_the_reference(page, base):
    open_home(page, base)
    assert page.locator(".action span").all_inner_texts() == ["New Enquiry", "My Enquiries", "RFQ / Quotes", "Orders", "Invoices", "Payments"]
    assert page.locator(".cat span").all_inner_texts() == ["CNC Machining", "VMC", "Turning", "Welding"]
    assert page.locator(".tab span").all_inner_texts() == ["Home", "Enquiries", "Orders", "Profile"]
    for image in page.locator(".home img").all():
        image.evaluate("el => el.complete || new Promise(done => { el.onload = el.onerror = done; })")
        assert image.evaluate("el => el.naturalWidth") > 0


def test_quick_actions_open_their_screens(page, base):
    targets = {"My Enquiries": "/enquiries", "RFQ / Quotes": "/quotes", "Orders": "/orders", "Invoices": "/invoices", "Payments": "/payments", "New Enquiry": "/enquiry/new"}
    for label, path in targets.items():
        open_home(page, base)
        page.click(f".action:has-text('{label}')")
        page.wait_for_function("p => location.hash === '#' + p", arg=path)


def test_category_preselects_the_enquiry(page, base):
    open_home(page, base)
    page.click(".cat-vmc")
    page.wait_for_function("location.hash === '#/enquiry/new?category=vmc'")


def test_tabs_and_fab_navigate(page, base):
    open_home(page, base)
    page.click(".fab")
    page.wait_for_function("location.hash === '#/enquiry/new'")
    open_home(page, base)
    page.click(".tab:has-text('Orders')")
    page.wait_for_function("location.hash === '#/orders'")


def test_menu_opens_navigates_and_logs_out(page, base):
    open_home(page, base)
    page.click("[data-menu]")
    assert page.inner_text(".drawer-head strong") == "Gugan Tennyson"
    page.click(".drawer nav button:has-text('Invoices')")
    page.wait_for_function("location.hash === '#/invoices'")
    open_home(page, base)
    page.click("[data-menu]")
    page.click("#drawer-out")
    page.wait_for_function("location.hash === '#/welcome'")
    assert page.evaluate("localStorage.getItem('jobwork.session')") is None


def test_menu_closes_when_tapping_outside(page, base):
    open_home(page, base)
    page.click("[data-menu]")
    page.mouse.click(410, 400)
    assert page.locator(".drawer").count() == 0


def test_guest_is_asked_to_log_in(page, base):
    open_as(page, base, "/home", '{"guest":true,"role":"customer"}')
    page.wait_for_selector(".home")
    page.click(".action:has-text('Orders')")
    page.wait_for_selector("text=Login Required")
    page.click("#gate-register")
    page.wait_for_function("location.hash === '#/register'")


def test_signed_out_visitor_is_sent_to_welcome(page, base):
    page.goto(f"{base}/index.html#/home")
    page.wait_for_function("location.hash === '#/welcome'")


def test_bell_opens_notifications(page, base):
    open_home(page, base)
    assert page.locator(".bell-dot").count() == 0
    page.click(".head-bell")
    page.wait_for_selector(".note")
    assert page.locator(".note").count() == 2


def test_failed_load_shows_retry(page, base):
    open_as(page, base, "/none")
    page.wait_for_selector("text=That page does not exist.")
    page.evaluate("localStorage.setItem('jobwork.failNext', '1')")
    page.evaluate("location.hash = '#/home'")
    page.wait_for_selector("#retry")
    page.click("#retry")
    page.wait_for_selector(".home")
