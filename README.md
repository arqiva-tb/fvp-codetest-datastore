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

## Requirements

### Implement the handler for the Schedules API event

* Code should be clear, and easy to understand.
* Entities should be strongly typed.
* Make use of patterns where appropriate.
* Comments should be included where appropriate to clear up any potential
  uncertainties for a reader, though self documenting code is preferred.
* Your logic should be thoroughly tested.
* Code should be designed to minimise database calls, using all available
  features of the schema. (see resources/dynamodb.yml)
* You may spend as much or as little time on this exercise as you wish,
  but we'll need your response within one week.

### Schedules API

This API is expected to expose details of programs that are scheduled
to be broadcast in a window of 6 hours, beginning at the provided start
time. It shall return the required data in json format.

#### Query params:
* start_time: int. This timestamp must be a multiple of 6 hours from 00:00 UTC
                   e.g. <int> 2019-03-17T09:00:00+00:00
                   Mandatory

#### Response example:
```
{
  success: true,
  events: [
    {
      program_id: string (TVA Crid)
      titles: ITitle[]
      launchUrls: ILaunchUrl[]
      images: IImage[]
      startTime: Date<ISO 8601>
      endTime: Date<ISO 8601>
    },
    ...
  ]
}
```

## Background

The FVP MDS (metadata system) stores the metadata of programs being broadcast
on TV. The data comes from content providers in the TVA (TV Anytime) format,
and the data storage service is responsible for converting this to JSON and
storing it in DynamoDB, as well as providing APIs to abstract DynamoDB
and expose the metadata to other components in the system.

### Ingest

This is achieved by providing a lambda which responds to certain events, fetches
the content of the TVA payload (if applicable), converts it to JSON using xml2js,
then writes a row to DynamoDB. The row contains certain specific attributes for
the program, as defined below, as well as the entire JSON representation.

There are three entry points for this lambda.
* HTTP POST
  This is used to post new, or update existing, content into the system.
* HTTP PUT
  This is used to replicate payloads from other environments.
* S3 API
  This is an experimental API to pull content that is placed in an S3 bucket.

#### The TVA Format

TVA is an XML representation of TV Program information. It can include information
such as titles, images, details of broadcasts and more. The requirements below
should make clear all you need to know in order to successfully parse the
information required from the TVA.

#### Ingesting content for testing

The example content in `examples/*.xml` can be loaded to test your
implementation, using the ingest API. For example:
```
$ curl -X POST https://<your stack url>/dev/api/transaction/ingest -d @tests/Resources/programs/1/input.xml
```
