#!/usr/bin/python3
# encoding=utf-8
import base64
import os
from datetime import datetime

import boto3
from aws_lambda_powertools import Logger, Tracer
from aws_lambda_powertools.event_handler import AppSyncResolver
from aws_lambda_powertools.logging import correlation_paths

tracer = Tracer()
logger = Logger()
app = AppSyncResolver()

session = boto3.session.Session()
client = boto3.client("ssm")
region = session.region_name or "eu-west-1"
hybrid_activation_iam_role_name = os.environ.get("HYBRID_ACTIVATION_IAM_ROLE_NAME")


@logger.inject_lambda_context(correlation_id_path=correlation_paths.APPSYNC_RESOLVER)
@tracer.capture_lambda_handler
def lambda_handler(event, context):
    return app.resolve(event, context)


@app.resolver(type_name="Mutation", field_name="deviceActivation")
def deviceActivation(
    hostname: str, fleetName: str, fleetId: str, deviceUiPassword: str, deviceType: str
):
    try:
        now = datetime.now()
        datestr = now.strftime("%Y-%m-%d-%H:%M")

        encodedDeviceUiPassword = base64.b64encode(
            deviceUiPassword.encode("utf-8")
        ).decode(
            "utf-8"
        )  # encode to allow for special characters

        response = client.create_activation(
            Description="Hybrid activation for DREM",
            DefaultInstanceName=hostname + " - " + datestr,
            IamRole=hybrid_activation_iam_role_name,
            RegistrationLimit=1,
            Tags=[
                {"Key": "Name", "Value": hostname + " - " + datestr},
                {"Key": "Type", "Value": deviceType},
                {"Key": "fleetName", "Value": fleetName},
                {"Key": "fleetId", "Value": fleetId},
                {"Key": "DeviceUiPassword", "Value": encodedDeviceUiPassword},
            ],
        )

        return_data = {
            "region": region,
            "activationCode": response["ActivationCode"],
            "activationId": response["ActivationId"],
        }

        logger.info(return_data)

        return return_data

    except Exception as error:
        logger.exception(error)
        return error
