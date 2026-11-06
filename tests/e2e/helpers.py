CUSTOMER = '{"userId":"u-gugan","role":"customer"}'
VENDOR = '{"userId":"u-precision","role":"vendor"}'


def sign_in(page, base, session=CUSTOMER):
    page.goto(f"{base}/index.html#/none")
    page.evaluate("s => localStorage.setItem('jobwork.session', s)", session)


def open_as(page, base, path, session=CUSTOMER):
    sign_in(page, base, session)
    page.goto(f"{base}/index.html#{path}")
    page.reload()


def db(page):
    return page.evaluate("JSON.parse(localStorage.getItem('jobwork.db.v1'))")
