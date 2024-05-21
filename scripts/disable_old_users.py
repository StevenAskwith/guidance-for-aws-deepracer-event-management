import json
from datetime import date, datetime, timedelta

import boto3

today = date.today()
mature_date = today - timedelta(days = 30)
old_date = today - timedelta(days = 183)

session = boto3.session.Session()
cognito_client = boto3.client("cognito-idp")
region = session.region_name or "eu-west-1"

cognito_client = boto3.client("cognito-idp")
user_pool_id = "" # add user pool ID here e.g. eu-west-1_AbcdEF1G2

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))

def disable_user(user_pool_id: str, username: str):
    response = cognito_client.admin_disable_user(
        UserPoolId=user_pool_id,
        Username=username
    )

paginator = cognito_client.get_paginator("list_users")
response_iterator = paginator.paginate(
    UserPoolId=user_pool_id,
    PaginationConfig={
        "PageSize": 60,
    },
    #Filter='cognito:user_status = "FORCE_CHANGE_PASSWORD"'
    Filter='status = "Enabled"'
)

users = []
for r in response_iterator:
    users.append(r["Users"])

all_users = [item for sublist in users for item in sublist]

not_created_for_long_enough_counter = 0
auth_events_inactive_counter = 0
auth_events_active_counter = 0
no_auth_events_counter = 0

for user in all_users:
    # print(user['Username'])
    # print(json.dumps(user, default=json_serial, indent=4))
    create_date = datetime.date(user['UserCreateDate'])
    if create_date < mature_date:
        #print(user['Username'] + " is mature")
        auth_events = cognito_client.admin_list_user_auth_events(
            UserPoolId=user_pool_id, Username=user["Username"]
        )['AuthEvents']
        if len(auth_events) == 0:
            print(user['Username'] + " has no auth events ***disabling user***")
            no_auth_events_counter = no_auth_events_counter + 1
            disable_user(user_pool_id, user['Username'])
            continue
        auth_events.sort(key=lambda x: x['CreationDate'], reverse=True)
        auth_event_date = datetime.date(auth_events[0]['CreationDate'])
        if auth_event_date < old_date:
            print(user['Username'] + " is inactive")
            auth_events_inactive_counter = auth_events_inactive_counter + 1
            # disable user...
        else:
            print(user['Username'] + " is active")
            auth_events_active_counter = auth_events_active_counter + 1
    else:
        # print(user['Username'] + " has not been created long enough")
        not_created_for_long_enough_counter = not_created_for_long_enough_counter + 1
    # break

print("")
print("not_created_for_long_enough_counter:" + str(not_created_for_long_enough_counter))
print("auth_events_inactive_counter:" + str(auth_events_inactive_counter))
print("auth_events_active_counter:" + str(auth_events_active_counter))
print("no_auth_events_counter:" + str(no_auth_events_counter))

