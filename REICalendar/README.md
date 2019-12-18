## reicalendar

This is where you include your WebPart documentation.

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

### Build options

gulp clean - TODO
gulp test - TODO
gulp serve - TODO
gulp bundle - TODO
gulp package-solution - TODO

### Using the webpart

Site Url: https://mpaa.sharepoint.com/sites/RM
List Name: Distribution Calendar
Description Field: reicalendar
Event Start Date: Start_x0020_Date
Event End Date: Filing_x0020_Deadline
Text Field to show in Calendar Control: Title
Tags: FieldName:Value#Color Code: Category:Paid#288054,Category:Planned#1D72C6,Category:Pending#682A7A,Category:Completed#126984,Category:In Progress#ED0233,Category:Blocked#3B3C2B,Category:Postponed#767956
Filters: #(and), |(or)