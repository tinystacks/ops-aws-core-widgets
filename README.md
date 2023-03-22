## Overview
This package contains a list of core AWS widgets.

## Widgets
|Name|Description|
|---------|---------|
|CloudWatch Logs|Renders a widget containing logs from a CloudWatchLogs log group or log stream.
|CloudWatch Metric Graph|Renders a widget containing graphs populated by one or many CloudWatch metrics.
|ECS Info|Renders a widget containing information about an ECS Service.
|ECS Deployments|Renders a widget containing information about an ECS Service's current deployments.

### CloudWatch Logs

<img width="1435" alt="cw-logs" src="https://user-images.githubusercontent.com/843204/227012413-20db9aa7-c19c-402b-ba6c-f7a3e2f3ce6f.png">

Renders a widget containing logs from a CloudWatchLogs log group or log stream.

|Parameter|Required|Type|Description|
|---------|---------|---------|---------|
|displayName|Yes|string|Display name of widget.
|providers|Yes|array<Provider>| A list of providers. The first provider must be of type AwsCredentialsProvider or results will not be retrieved.
|region|Yes|string|The AWS region to request logs from.
|logGroupName|Yes|String|The AWS LogGroup name to request logs from.
|logStreamName|No|String|The AWS LogStream name to request logs from. If this field is not specified, this widget will retrieve all log events in the LogGroup.
|timeRange|No|RelativeTime or AbsoluteTimeRange|The time range in which to look for logs
|showTimeRangeSelector|No|boolean|Whether to show the time range selector which supplies time-range overrides

### CloudWatch Metric Graph

![cw-metrics](https://user-images.githubusercontent.com/843204/226066808-bc94be2a-99d2-411b-a01b-423e301f14bf.png)

Renders a widget containing graphs populated by one or many CloudWatch metrics.

|Parameter|Required|Type|Description|
|---------|---------|---------|---------|
|displayName|Yes|string|Display name of widget.
|providers|Yes|array<Provider>| A list of providers. The first provider must be of type AwsCredentialsProvider or results will not be retrieved.
|region|Yes|string|The AWS region to request logs from.
|timeRange|No|RelativeTime or AbsoluteTimeRange|The time range in which to look for logs.
|period|No|number|The period, in seconds, used to populate data from CloudWatch.
|showTimeRangeSelector|No|boolean|Whether to show the time range selector which supplies time-range overrides.

### ECS Info

<img width="1435" alt="ecs-info" src="https://user-images.githubusercontent.com/843204/227012373-eca26676-0e9a-4df1-9ba0-f602c1de41ff.png">

Renders a widget containing information about an ECS Service.

|Parameter|Required|Type|Description|
|---------|---------|---------|---------|
|displayName|Yes|string|Display name of widget.
|providers|Yes|array<Provider>| A list of providers. The first provider must be of type AwsCredentialsProvider or results will not be retrieved.
|region|Yes|string|The AWS region to request logs from.
|clusterName|Yes|string|The name of the ECS Cluster.
|serviceName|Yes|string|The name of the ECS Service.

### ECS Deployments

<img width="1435" alt="ecs-deployments" src="https://user-images.githubusercontent.com/843204/227012354-060d9560-b327-4211-a95f-042c6eaf4eb0.png">

Renders a widget containing information about an ECS Service's current deployments.

|Parameter|Required|Type|Description|
|---------|---------|---------|---------|
|displayName|Yes|string|Display name of widget.
|providers|Yes|array<Provider>| A list of providers. The first provider must be of type AwsCredentialsProvider or results will not be retrieved.
|region|Yes|string|The AWS region the ECS Cluster is in.
|clusterName|Yes|string|The name of the ECS Cluster.
|serviceName|Yes|string|The name of the ECS Service.

## Parameters
|Name|Description|
|---------|---------|
|AbsoluteTimeRange|Range of absolute time.|
|RelativeTime|Time range defined relatively to current time.|

### AbsoluteTimeRange
Range of absolute time.

|Parameter|Required|Type|Description|
|---------|---------|---------|---------|
|startTime|Yes|number|The beginning of the time range as UNIX time.
|endTime|Yes|number|The end of the time range as UNIX time.

### RelativeTime
Range of absolute time.

|Parameter|Required|Type|Description|
|---------|---------|---------|---------|
|time|Yes|number|A number expressing how many units of time ago to start looking.
|unit|Yes|ns, ms, s, m, h, d, w, mo or yr|Units of time.

