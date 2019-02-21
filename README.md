# Data Storage Service

This project represents a simplification of the next version of the FVP 
(Freeview Play) data storage service. Below is an overview of the service, a set
of requirements, and some guidelines explaining what we'll be looking for in a
submission, as well as instructions on how to submit when you're finished.

Read this thoroughly and ensure you address all the points we've outlined
before submission.

## Submission instructions

* Branch from master
* Implement your solution
* Maintain a logical and clear commit history
* When you think you are ready, create a PR and request a review from @mrthehud

### Prerequisites

* We expect you to either have prior experience with the Serverless framework,
  or to be able to pick up what you need from the web.
* You should not need any experience with TVA, but we do expect you to understand
  XML, and also XSDs, which we use to validate content before processing, although
  you do not need to for this test.


## Overview

The FVP MDS (metadata system) stores the metadata of programs being broadcast 
on TV. The data comes from content providers in the TVA (TV Anytime) format,
and the data storage service is responsible for converting this to JSON and 
storing it in DynamoDB.

This is achieved by providing a lambda which responds to certain events, fetches
the content of the TVA payload (if applicable), converts it to JSON using xml2js,
then writes a row to DynamoDB. The row contains certain specific attributes for
the program, as defined below, as well as the entire JSON representation.

There are two entry points for this lambda. One is via an HTTP PUT api,
the other is by putting a file in an S3 Bucket.

### The TVA Format
TVA is an XML representation of TV Program information. It can include information
such as titles, images, details of broadcasts and more. The requirements below 
should make clear all you need to know in order to successfully parse the 
information required from the TVA.

## Requirements

### Endpoints

#### Implement the handler for the S3 PUT event

* The serverless.yml file creates a bucket in your stack. This bucket is configured
  to trigger the onS3Put handler exported from src/lambda.ts
* The config should be modified to only trigger if an xml file is uploaded.

#### Implement the handler for the HTTP PUT event

* Add configuration to serverless.yml to allow for the contents of a file to be
  sent via HTTP PUT.
* The request must specify a content type of application/xml. Any other content
  type should be rejected with an appropriate http response code.

### Data

Each payload will contain information pertinent to one program.
A program may have any number of OnDemand or BroadcastEvents.

If a payload does not contain a ProgramInformation element, then that program
must already exist in the data store.

The mappings described in `src/Datastore/Types.ts` should assist you in hydrating
the correct properties with the correct data.

The entities in `src/Tva/Types.ts` should reasonably describe the JSON representation of
the TVA payloads.

## Submission guidelines

* Code should be clear, and easy to understand.
* Make use of patterns where appropriate.
* Comments should be included to clear up any potential uncertainties for a reader.
* Your logic should be thoroughly tested, and able to handle all example payloads.
* You may spend as much or as little time on this exercise as you wish.

### Assessment

* There is no right solution! Each submission will be assessed by us against
  the guidelines above, and on it's own merit.
* We may have questions about your choices, and discuss them with you at the
  face to face interview.
* We may also ask you to assess the submission of someone else as a PR exercise
  in the face to face interview. The corollary of this is that your submission
  may also be reviewed by another candidate after we've finished assessing it.
