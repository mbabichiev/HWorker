# Installation

Clone the repository:
```bash
git clone https://github.com/mbabichiev/HWorker.git
```
Create file `.env`, where input:
```bash
DB_URL="url server mongo db"
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:8080"
JWT_ACCESS_SECRET_KEY="some access key"
JWT_REFRESH_SECRET_KEY="some refresh key"
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=example@gmail.com
```

Install all libraries:
```bash
npm install
```
Run the server:
```bash
node server.js
```

# Endpoints


## Authorization:

`POST - /api/auth/register`

```JavaScript
request:
{
    "firstname": "Firstname",
    "lastname": "Lastname",
    "login": "login",
    "password": "password",
    "email": "example@gmail.com",
}
```
```JavaScript
response:
{
    "accessToken": "some access token",
    "refreshToken": "some refresh token",
    "user": {
        "id": "user_id",
        "firstname": "Firstname",
        "lastname": "Lastname",
        "login": "login",
        "email": "example@gmail.com",
        "own_calendars": [
            "id of main calendar"
        ],
        "available_calendars": []
    }
}
```
`Errors:`
- `User with the login {login} already exists`
- `The email {email} already in use`
- `Invalid value: email`
- `Invalid value: firstname (min length: 1, max length: 12)`
- `Invalid value: lastname (min length: 1, max length: 12)`
- `Invalid value: login (min length: 6, max length: 12)`
- `Invalid value: password (min length: 6, max length: 12)`
#
`POST - /api/auth/login`
```JavaScript
request:
{
    "login": "login",
    "password": "password"
}
```
```JavaScript
response:
{
    "accessToken": "some access token",
    "refreshToken": "some refresh token",
    "user": {
        "id": "user_id",
        "firstname": "Firstname",
        "lastname": "Lastname",
        "login": "login",
        "email": "example@gmail.com",
        "own_calendars": ["ids of calendars"],
        "available_calendars": ["ids of calendars"]
    }
}
```
`Errors:`
- `User with the login {login} not found`
- `Wrong password`
- `Invalid value: login (min length: 6, max length: 12)`
- `Invalid value: password (min length: 6, max length: 12)`
#
`POST - /api/auth/logout`
```JavaScript
request: refresh_token in Cookies
```
```JavaScript
response: status 200
```
`Errors:`
- `No errors`


#
`POST - /api/auth/refresh`
```JavaScript
request: refresh_token in Cookies
```
```JavaScript
response:
{
    "accessToken": "some access token",
    "refreshToken": "some refresh token",
    "user": {
        "id": "user_id",
        "firstname": "Firstname",
        "lastname": "Lastname",
        "login": "login",
        "email": "example@gmail.com",
        "own_calendars": ["ids of calendars"],
        "available_calendars": ["ids of calendars"]
    }
}
```
`Errors:`
- `User is not authorized`
#

`POST - /api/auth/reset`
```JavaScript
request:
{
    "email": "example@gmail.com"
}
```
```JavaScript
response: status 200
```
`Errors:`
- `User with the email {email} not found`
- `Invalid value: email`
#

`POST - /api/auth/reset/:token`
```JavaScript
request:
{
    "password": "new password"
}
```
```JavaScript
response:
{
    "accessToken": "some access token",
    "refreshToken": "some refresh token",
    "user": {
        "id": "user_id",
        "firstname": "Firstname",
        "lastname": "Lastname",
        "login": "login",
        "email": "example@gmail.com",
        "own_calendars": ["ids of calendars"],
        "available_calendars": ["ids of calendars"]
    }
}
```
`Errors:`
- `Token not found`
- `User not found`
- `Invalid value: password (min length: 6, max length: 12)`
#

`GET - /api/auth/profile`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response:
{
    "user": {
        "id": "user_id",
        "firstname": "Firstname",
        "lastname": "Lastname",
        "login": "login",
        "email": "example@gmail.com",
        "own_calendars": ["ids of calendars"],
        "available_calendars": ["ids of calendars"]
    }
}
```
`Errors:`
- `User is not authorized`

#

## Calendars:

Create calendar:

`POST - /api/calendars`
```JavaScript
request: 'Bearer access_token' in Authorization,
{
    "name": "calendar name",
    "category": "calendar category",
    "description": "calendar description" // not required
}
```
```JavaScript
response:
{
    "calendar": {
        "id": "calendar id",
        "name": "calendar name",
        "description": "calendar description",
        "category": "calendar category",
        "users": [
            {
                "user_id": "owner id",
                "role": "owner",
                "color": "rgb(57, 58, 62)",
                "_id": "id in arr"
            }, 
            ...
        ],
        "events": ["array of event ids"]
    }
}
```
`Errors:`
- `User with id {owner_id} not found`
- `Calendar with name {name} already exists`
- `User is not authorized`
- `Category should be only arrangement/reminder/task`
- `Invalid value: name (min length: 1, max length: 20)`
- `Invalid value: description (max length: 100)`

#
Get calendars:

`GET - /api/calendars/:id`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response:
{ 
    "calendar": {
        "id": "calendar id",
        "name": "calendar name",
        "description": "calendar description",
        "category": "calendar category",
        "users": [
            {
                "id": "user id",
                "firstname": "Firstname",
                "lastname": "Lastname",
                "login": "login",
                "email": "example@gmail.com",
                "role": "owner",
                "color": "rgb(57, 58, 62)"
            },
            ...
        ],
        "events": ["array of event ids"]
    }
}
```
`Errors:`
- `User is not authorized`
- `Calendar not found`
- `This calendar is not available to you`

#

Invite user by email:

`POST - /api/calendars/invite`
```JavaScript
request: 'Bearer access_token' in Authorization,
{
    "email": "example@gmail.com",
    "calendar_id": "calendar id"
}
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar id)
- `Calendar not found`
- `Only owner and admins can invite others`
- `User with email {email} not found`
- `User with email {email} ({user.login}) is already using this calendar`
- `You can't invite yourself`

#

Update information about calendar:

`PATCH - /api/calendars/:id`
```JavaScript
request: 'Bearer access_token' in Authorization,
{
    // choose fields you want to update
    "name": "calendar name",
    "description": "calendar description",
    "category": "calendar category",
}
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar id)
- `Calendar not found`
- `Calendar can be edited only by owner`
- `You can't change the name of the main calendar`
- `Category should be only arrangement/reminder/task`

#

Update information about user in calendar:

`PATCH - /api/calendars/:calendar_id/user/:user_id`
```JavaScript
request: 'Bearer access_token' in Authorization,
{
    "role": "user role",
    "color": "user color"
}
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/user id)
- `Invalid role` (not user/admin)
- `Calendar not found`
- `This calendar is not available to you`
- `User don't use this calendar`
- `Only owner can change roles of calendar users`
- `Only owner and admins can edit theme colors of others`
- `Only owner can edit theme colors of admins`

#

Remove user from calendar:

`DELETE - /api/calendars/:calendar_id/user/:user_id`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/user id)
- `Calendar not found`
- `This calendar is not available to you`
- `User don't use this calendar`
- `Noone can remove owner from calendar`
- `Only owner and admins can edit users in calendar`
- `Only owner can remove admins from calendar`
- `User not found`

#

Delete calendar:

`DELETE - /api/calendars/:id`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar id)
- `Calendar not found`
- `Calendar can be deleted only by owner`
- `You can't delete the main calendar`
- `User not found`


#

## Events

Create event:

`POST - /api/calendars/:calendar_id/events`
```JavaScript
request: 'Bearer access_token' in Authorization
{
    "name": "name", // 1-20 symbols
    "start_time": time_in_ms,
    "end_time": time_in_ms
}
```
```JavaScript
response:
{
    "id": "event id",
    "creater_id": "owner id",
    "calendar_id": "calendar id",
    "name": "name",
    "start_time": "01.01.2022, 10:10:10",
    "end_time": "01.01.2022, 10:10:20"
}
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/owner id)
- `You cannot create events in the past`
- `Min time for event - 1 second`
- `Calendar not found`
- `Calendar is not avaliable for you`
- `The time of the event overlaps with others`

#

Get all events by calendar id:

`GET - /api/calendars/:calendar_id/events`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response: 
[
    {
        "id": "event id",
        "creater_id": "owner id",
        "calendar_id": "calendar id",
        "name": "test",
        "start_time": "01.01.2022, 10:10:10",
        "end_time": "01.01.2022, 10:10:20"
    }
    ...
]
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/user id)
- `Calendar not found`
- `Calendar is not avaliable for you`

#

Get event by id:

`GET - /api/calendars/:calendar_id/events/:event_id`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response: 
{
    "id": "event id",
    "creater_id": "owner id",
    "calendar_id": "calendar id",
    "name": "name",
    "start_time": "01.01.2022, 10:10:10",
    "end_time": "01.01.2022, 10:10:20"
}
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/user/event id)
- `Calendar not found`
- `Calendar is not avaliable for you`
- `Event not found`
- `This event not for this calendar`

#

Update event:

`PATCH - /api/calendars/:calendar_id/events/:event_id`
```JavaScript
request: 'Bearer access_token' in Authorization
{
    // choose fields you want to update
    "name": "name", // 1-20 symbols
    "start_time": time_in_ms,
    "end_time": time_in_ms
}
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/owner/event id)
- `Calendar not found`
- `Calendar is not avaliable for you`
- `Event not found`
- `This event not for this calendar`
- `Users can edit only own events`
- `Admins can edit only own events and events of users`
- `The time of the event overlaps with others`

#

Delete event:

`DELETE - /api/calendars/:calendar_id/events/:event_id`
```JavaScript
request: 'Bearer access_token' in Authorization
```
```JavaScript
response: status 200
```
`Errors:`
- `User is not authorized`
- `Invalid id` (calendar/owner/event id)
- `Calendar not found`
- `Calendar is not avaliable for you`
- `Event not found`
- `This event not for this calendar`
- `Users can delete only own events`
- `Admins can delete only own events and events of users`

#
