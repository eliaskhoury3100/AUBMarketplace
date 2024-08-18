# This AWS Lambda function processes a product upload request, 
# storing product details and associated images in an S3 bucket and DynamoDB table, 
# including converting price to Decimal, 
# and recording the upload time in ISO 8601 format.

import json
import boto3
from uuid import uuid4
import base64
import datetime  # Import the datetime module
from decimal import Decimal  # Import Decimal from the decimal module

# Initialize the S3 and DynamoDB clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table_name = 'AUBMarketPlaceMainTable'
bucket_name = 'marketplaceproductspictures'

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        userId = body['userId']
        name = body['name']
        description = body['description']
        condition = body['condition']
        price = Decimal(body['price']) if 'price' in body and body['price'] else Decimal('0') # change type from string to decimal
        currency = body['currency']
        category = body['category']
        size= body['size']
        warranty= body['warranty']
        files = body.get('files', [])
        product='product'
        state= 'state'
        image_urls = []

        for file_info in files:
            file_name = file_info['name']
            file_content = base64.b64decode(file_info['content'])
            file_key = f"{userId}/{file_name}"
            s3.put_object(Bucket=bucket_name, Key=file_key, Body=file_content)
            image_url = f"https://{bucket_name}.s3.amazonaws.com/{file_key}"
            image_urls.append(image_url)
        
        productId = "ITEM#" + str(uuid4())  
        
        # Get the current time in ISO 8601 format
        upload_time = datetime.datetime.now().isoformat()


        table = dynamodb.Table(table_name)
        table.put_item(
            Item={
                'UserID': userId,         
                'SK': productId,     # Sort Key
                'Title': name,
                'Description': description,
                'Condition': condition,
                'Price': price,
                'Size': size,
                'Warranty': warranty,
                'Currency': currency,
                'PK': category,     
                'ImageUrl': image_urls,
                'PRODUCT': product,
                'State': 'for sale',
                'UploadDate': upload_time # Store the upload time
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Product uploaded successfully'}),
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }

    except Exception as e:
        print('Error:', e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error processing request', 'error': str(e)}), # for debugging
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        }
