GOOD = {
    "name": "Meena Kumar",
    "mobile": "9123456780",
    "email": "meena@example.com",
    "password": "Secret123",
    "confirm": "Secret123",
}


def open_register(page, base):
    page.goto(f"{base}/index.html#/register")
    page.wait_for_selector(".role-switch")


def fill(page, **overrides):
    for name, value in {**GOOD, **overrides}.items():
        page.fill(f"[name={name}]", value)


def agree(page):
    page.locator(".check").click()


def test_every_field_is_required(page, base):
    open_register(page, base)
    page.click("#submit")
    for message in ("Enter your full name.", "Enter a valid 10-digit mobile number.", "Enter a valid email address.", "Use at least 8 characters.", "Passwords do not match.", "Please accept the Terms & Conditions."):
        page.wait_for_selector(f"text={message}")


def test_invalid_values_are_rejected(page, base):
    open_register(page, base)
    fill(page, mobile="12345", email="not-an-email", password="abcdefgh", confirm="different")
    agree(page)
    page.click("#submit")
    page.wait_for_selector("text=Enter a valid 10-digit mobile number.")
    assert page.locator("text=Enter a valid email address.").is_visible()
    assert page.locator("text=Use both letters and numbers.").is_visible()
    assert page.locator("text=Passwords do not match.").is_visible()
    assert page.evaluate("localStorage.getItem('jobwork.session')") is None


def test_errors_clear_once_fixed(page, base):
    open_register(page, base)
    page.click("#submit")
    page.wait_for_selector("text=Enter your full name.")
    fill(page)
    page.click("#submit")
    page.wait_for_selector("text=Please accept the Terms & Conditions.")
    assert page.locator("text=Enter your full name.").count() == 0


def test_customer_registers_and_can_log_in_again(page, base):
    open_register(page, base)
    fill(page)
    agree(page)
    page.click("#submit")
    page.wait_for_function("location.hash === '#/home'")
    page.evaluate("localStorage.removeItem('jobwork.session')")
    page.goto(f"{base}/index.html#/login")
    page.fill("[name=identifier]", "meena@example.com")
    page.fill("[name=password]", "Secret123")
    page.click("#submit")
    page.wait_for_function("location.hash === '#/home'")


def test_vendor_registers_unverified(page, base):
    open_register(page, base)
    page.click("[data-role=vendor]")
    assert page.get_attribute("[data-role=vendor]", "aria-selected") == "true"
    fill(page)
    agree(page)
    page.click("#submit")
    page.wait_for_function("location.hash === '#/v/home'")
    db = page.evaluate("JSON.parse(localStorage.getItem('jobwork.db.v1'))")
    vendor = next(v for v in db["vendors"] if v["name"] == "Meena Kumar")
    assert vendor["verified"] is False


def test_existing_email_is_refused(page, base):
    open_register(page, base)
    fill(page, email="gugan@jobwork.com")
    agree(page)
    page.click("#submit")
    page.wait_for_selector("text=An account with this email already exists.")


def test_existing_mobile_is_refused(page, base):
    open_register(page, base)
    fill(page, mobile="+91 98765 43210")
    agree(page)
    page.click("#submit")
    page.wait_for_selector("text=An account with this mobile number already exists.")


def test_terms_open_and_close(page, base):
    open_register(page, base)
    page.click("#terms-link")
    page.wait_for_selector(".sheet")
    page.click("#terms-close")
    assert page.locator(".sheet").count() == 0


def test_back_and_login_links(page, base):
    open_register(page, base)
    page.click(".form-foot .link")
    page.wait_for_function("location.hash === '#/login'")
