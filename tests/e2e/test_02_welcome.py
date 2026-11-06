def open_welcome(page, base):
    page.goto(f"{base}/index.html#/welcome")
    page.wait_for_selector(".welcome")


def sign_in(page, identifier, password):
    page.fill("[name=identifier]", identifier)
    page.fill("[name=password]", password)
    page.click("#submit")


def test_content_matches_the_reference(page, base):
    open_welcome(page, base)
    assert page.inner_text(".welcome-word") == "JobWork"
    assert page.locator(".welcome-badges li").all_inner_texts() == ["Secure", "Reliable", "Fast"]
    art = page.locator(".welcome-art")
    art.evaluate("el => el.complete || new Promise(done => { el.onload = el.onerror = done; })")
    assert art.evaluate("el => el.naturalWidth") > 0


def test_login_and_register_links(page, base):
    open_welcome(page, base)
    page.click(".welcome-register")
    page.wait_for_function("location.hash === '#/register'")
    open_welcome(page, base)
    page.click(".welcome-login")
    page.wait_for_selector("#form")


def test_guest_starts_a_guest_session(page, base):
    open_welcome(page, base)
    page.click("#guest")
    page.wait_for_function("location.hash === '#/home'")
    assert page.evaluate("JSON.parse(localStorage.getItem('jobwork.session')).guest") is True


def test_login_requires_both_fields(page, base):
    page.goto(f"{base}/index.html#/login")
    page.click("#submit")
    page.wait_for_selector("text=Enter your email or mobile number.")
    assert page.locator("text=Enter your password.").is_visible()


def test_wrong_password_shows_an_error(page, base):
    page.goto(f"{base}/index.html#/login")
    sign_in(page, "gugan@jobwork.com", "wrong")
    page.wait_for_selector("text=Incorrect email, mobile number or password.")
    assert page.evaluate("localStorage.getItem('jobwork.session')") is None


def test_customer_logs_in_by_email_or_mobile(page, base):
    for identifier in ("gugan@jobwork.com", "+91 98765 43210"):
        page.goto(f"{base}/index.html#/login")
        page.reload()
        sign_in(page, identifier, "Demo@123")
        page.wait_for_function("location.hash === '#/home'")
        page.evaluate("localStorage.clear()")


def test_vendor_login_goes_to_the_vendor_home(page, base):
    page.goto(f"{base}/index.html#/login")
    page.click(".demo-chip[data-email='vendor@jobwork.com']")
    page.click("#submit")
    page.wait_for_function("location.hash === '#/v/home'")


def test_show_password_toggle(page, base):
    page.goto(f"{base}/index.html#/login")
    page.wait_for_selector(".field-eye")
    page.click(".field-eye")
    assert page.get_attribute("[name=password]", "type") == "text"
    page.click(".field-eye")
    assert page.get_attribute("[name=password]", "type") == "password"


def test_password_reset_checks_the_account(page, base):
    page.goto(f"{base}/index.html#/login")
    page.click("#forgot")
    page.fill("#reset-id", "nobody@example.com")
    page.click("#reset-send")
    page.wait_for_selector("text=No account uses that email or mobile number.")
    page.fill("#reset-id", "gugan@jobwork.com")
    page.click("#reset-send")
    page.wait_for_selector("text=Reset link sent.")


def test_failed_request_shows_an_error_and_allows_retry(page, base):
    page.goto(f"{base}/index.html#/login")
    page.wait_for_selector("#form")
    page.evaluate("localStorage.setItem('jobwork.failNext', '1')")
    sign_in(page, "gugan@jobwork.com", "Demo@123")
    page.wait_for_selector("text=Could not reach JobWork. Please try again.")
    page.click("#submit")
    page.wait_for_function("location.hash === '#/home'")


def test_markup_in_input_is_not_rendered(page, base):
    page.goto(f"{base}/index.html#/login")
    sign_in(page, "<img src=x onerror=alert(1)>", "x")
    page.wait_for_selector("text=Incorrect email, mobile number or password.")
    assert page.locator(".form-page img").count() == 0
