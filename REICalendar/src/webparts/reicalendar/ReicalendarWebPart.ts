import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'ReicalendarWebPartStrings';
import Reicalendar from './components/Reicalendar';
import { IReicalendarProps } from './components/IReicalendarProps';

export interface IReicalendarWebPartProps {
  Filter: string;
  Tag: string;
  description: string;
  StartDate: string;
  EndDate: string;
  Title: string;
  Url:string;
  SiteUrl:string;
  ListName:string;
}

export default class ReicalendarWebPart extends BaseClientSideWebPart<IReicalendarWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IReicalendarProps > = React.createElement(
      Reicalendar,
      {        
        SiteUrl:this.properties.SiteUrl,
        ListName:this.properties.ListName,
        description: this.properties.description,
        StartDate: this.properties.StartDate,
        EndDate: this.properties.EndDate,
        Title: this.properties.Title,
        Url: this.properties.Url,
        Tag: this.properties.Tag,
        Filter: this.properties.Filter,        
        HttpClient:this.context.spHttpClient
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('SiteUrl', {
                  label: "Site Url",
                  placeholder:"https://test.sharepoint.com/sites/mysite"
                }),
                PropertyPaneTextField('ListName', {
                  label: "List Name",
                  placeholder:"My List"
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('StartDate', {
                  label: "Event Start Date",
                  placeholder:"Start_x0020_Date"
                }),
                PropertyPaneTextField('EndDate', {
                  label: "Event End Date",
                  placeholder:"Filing_x0020_Deadline"
                }),
                PropertyPaneTextField('Title', {
                  label: "Text Field to show in Calendar Control",
                  placeholder:"Title"
                }),
                PropertyPaneTextField('Tag', {
                  label: "Tags: FieldName:Value#Color Code",
                  placeholder:"Category:Planned#5F62FB,Category:Paid#04E939"
                }),
                PropertyPaneTextField('Filter', {
                  label: "Filters: #(and), |(or)",
                  placeholder:"Studios:Disney#Studios:MGM|Group:ARW"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
