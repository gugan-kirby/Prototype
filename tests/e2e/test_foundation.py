def test_app_boots_and_handles_unknown_route(page, base):
    page.goto(f"{base}/index.html#/does-not-exist")
    page.wait_for_selector("text=That page does not exist.")
    assert page.inner_text("#statusbar").startswith("9:41")


def test_phone_fills_a_small_viewport_without_side_scroll(page, base):
    page.set_viewport_size({"width": 360, "height": 740})
    page.goto(f"{base}/index.html#/does-not-exist")
    page.wait_for_selector("text=That page does not exist.")
    assert page.evaluate("document.getElementById('phone').offsetWidth") == 360
    assert page.evaluate("document.documentElement.scrollWidth") == 360
