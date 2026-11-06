CUSTOMER = {"jobwork.session": '{"userId":"u-gugan","role":"customer"}'}

SCREENS = [
    {"id": "01-splash", "ref": "JobWork_Screen_01_Splash.png", "route": "/", "size": (388, 900)},
    {"id": "02-welcome", "ref": "JobWork Industrial Welcome Screen.png", "route": "/welcome"},
    {"id": "03-register", "ref": "Mobile Register Screen UI.png", "route": "/register"},
    {"id": "04-home", "ref": "JobWork Precision Dashboard.png", "route": "/home", "session": CUSTOMER},
    {"id": "05-details", "ref": "JobWork New Enquiry Form.png", "route": "/enquiry/new", "session": CUSTOMER},
]
