# This AWS Lambda function retrieves product details from DynamoDB using a product ID, 
# then fetches the associated user's email from Cognito, and returns this combined information. 
# If the product isn't found or an error occurs, it returns an appropriate error message.

import json
from decimal import Decimal
import boto3

# Custom JSON Encoder to handle Decimal types from DynamoDB
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)  # Convert decimal instances to float. Choose int if that's better for your use case.
        return super(DecimalEncoder, self).default(obj)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
cognito_idp = boto3.client('cognito-idp')

# Add your Cognito User Pool ID here
USER_POOL_ID = 'eu-north-1_yY06qHPlb'

def lambda_handler(event, context):
    # Table name and index name
    table_name = 'AUBMarketPlaceMainTable'
    index_name = 'SK-PRODUCT-index'
    table = dynamodb.Table(table_name)

    # Extract the product_id from the query parameters
    product_id = event['queryStringParameters']['product_id']

    try:
        # Query DynamoDB using the provided index and product_id
        response = table.query(
            IndexName=index_name,
            KeyConditionExpression="SK = :sk AND PRODUCT = :product",
            ExpressionAttributeValues={
                ':sk': product_id,
                ':product': 'product'
            }
        )
        
        # Check if the query returned any items
        if not response['Items']:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Product not found'}, cls=DecimalEncoder)
            }

        # Extract the product details
        product_details = response['Items'][0]

        # Fetch the user email from Cognito using UserID stored in product_details
        user_id = product_details.get('UserID')
        user_info = cognito_idp.admin_get_user(
            UserPoolId=USER_POOL_ID,
            Username=user_id
        )
        email = next((attr['Value'] for attr in user_info['UserAttributes'] if attr['Name'] == 'email'), None)
        
        # Include email in the product details
        product_details['UserEmail'] = email

        return {
            'statusCode': 200,
            'body': json.dumps(product_details, cls=DecimalEncoder),
            'headers': {'Content-Type': 'application/json'}
        }

    except Exception as e:
        print(f"Error querying DynamoDB or Cognito: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)}, cls=DecimalEncoder),
            'headers': {'Content-Type': 'application/json'}
        }
