# This AWS Lambda function is triggered by a Cognito event 
# and subscribes a new user to an SNS (Simple Notification Service) 
# topic based on the first three characters of their email address.

import boto3
import json

def lambda_handler(event, context):
    # Initialize the SNS client
    sns = boto3.client('sns')
    
    # Retrieve the user's email from the Cognito event data
    user_email = event['request']['userAttributes']['email']
    
    # Extract the first three characters from the email as initials
    initials = user_email[:3].lower()  # Convert to lower case for consistency
    
    # Specify your SNS topic ARN here
    topic_arn = 'arn:aws:sns:eu-north-1:851725189420:LostIDs'
    
    # Create the filter policy to only receive messages with these initials
    filter_policy = json.dumps({
        "initials": [initials]
    })
    
    # Subscribe the email to the topic with a filter policy
    response = sns.subscribe(
        TopicArn=topic_arn,
        Protocol='email',
        Endpoint=user_email,  # User's email address
        Attributes={
            'FilterPolicy': filter_policy
        }
    )
    
    # Optional: Log the subscription response
    print("Subscription successful:", response)
    
    # Continue the workflow
    return event
