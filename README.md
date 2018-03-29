# spoact.si

Software landing page for webpage, which was made for data menagment for psichiatrists who works on european ACT project in slovenia. Access on: www.spoact.si.

Requirements:
 - npm & nodeJs,
 - mongodb.

Before making it live:
  - edit /backend/config.json, put:
    - db url and name,
    - mailer configurator,
    - recaptcha secret,
  - login for recaptcha on https://www.google.com/recaptcha/admin#list providing your site informations
  - create database with choosen name
  - on /frontend/index.html edit js; set site key as yours public key from recaptcha.
  - on /frontend/index.html edit js; set GA_TRACKING_ID for google analytics
