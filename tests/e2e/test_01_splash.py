def open_splash(page, base):
    page.goto(f"{base}/index.html#/")
    page.wait_for_selector(".splash")


def test_content_matches_the_reference(page, base):
    open_splash(page, base)
    assert page.inner_text(".splash-word") == "JobWork"
    assert page.inner_text(".splash-tag").split("\n") == ["Find Trusted Machines.", "Get Quality Work Done."]
    assert page.evaluate("document.querySelector('.splash-logo').naturalWidth") > 0


def test_get_started_opens_welcome(page, base):
    open_splash(page, base)
    page.click(".splash-start")
    page.wait_for_function("location.hash === '#/welcome'")


def test_login_register_opens_login(page, base):
    open_splash(page, base)
    page.click(".splash-link")
    page.wait_for_function("location.hash === '#/login'")


def test_controls_stay_on_screen_at_small_and_short_sizes(page, base):
    for width, height in ((320, 568), (360, 740), (390, 844), (430, 932)):
        page.set_viewport_size({"width": width, "height": height})
        open_splash(page, base)
        for selector in (".splash-word", ".splash-start", ".splash-link"):
            box = page.locator(selector).bounding_box()
            assert box["x"] >= 0 and box["x"] + box["width"] <= width, (selector, width)
        assert page.evaluate("document.documentElement.scrollWidth") <= width
        page.locator(".splash-link").scroll_into_view_if_needed()
        assert page.locator(".splash-link").is_visible()
