import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'ReiCalendarListviewWebPartStrings';
import ReiCalendarListview from './components/ReiCalendarListview';
import { IReiCalendarListviewProps } from './components/IReiCalendarListviewProps';

const defaultview = [
  {
    "name": "Title",
    "sorting": true,
    "isResizable": true,
    "maxWidth": 315,
    "displayName": "Title",
    "linkPropertyName": "ViewUrl"
  },
  {
    "name": "Action_x0020_Required",
    "sorting": true,
    "maxWidth": 256,
    "isResizable": true,
    "displayName": "Action Required"
  },
  {
    "name": "Filing_x0020_Deadline",
    "maxWidth": 100,
    "sorting": true,
    "isResizable": true,
    "displayName": "Filing Deadline"
  },
  {
    "name": "HiddenColumn",
    "defaultSort": "Asc",
    "isDate": true,
    "isHidden": true
  },
  {
    "name": "MyStudios",
    "maxWidth": 295,
    "sorting": true,
    "isResizable": true,
    "displayName": "Pending Studios"
  },
  {
    "name": "MPAA_x0020_Report.Description",
    "sorting": true,
    "maxWidth": 130,
    "isResizable": true,
    "displayName": "MPAA Report",
    "linkPropertyName": "MPAA_x0020_Report.Url"
  }
];

const SampleGroup = [{ "name": "Country", "order": 1 }, { "name": "Title", "order": 2 }];

export interface IReiCalendarListviewWebPartProps {
  description: string;
  SiteUrl: string;
  ListName: string;
  ViewConfig: string;
  GroupConfig: string;
  ItemSize: string;
  DefaultFilter: string;
  HideSearch: string;
}

export default class ReiCalendarListviewWebPart extends BaseClientSideWebPart<IReiCalendarListviewWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IReiCalendarListviewProps> = React.createElement(
      ReiCalendarListview,
      {
        SiteUrl: this.properties.SiteUrl,
        ListName: this.properties.ListName,
        description: this.properties.description,
        ViewConfig: this.properties.ViewConfig,
        GroupConfig: this.properties.GroupConfig,
        HttpClient: this.context.spHttpClient,
        ItemSize: this.properties.ItemSize,
        DefaultFilter: this.properties.DefaultFilter,
        HideSearch: this.properties.HideSearch
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
                  placeholder: "https://mpaa.sharepoint.com/sites/RM/devclassic"
                }),
                PropertyPaneTextField('ListName', {
                  label: "List Name",
                  placeholder: "Distribution Calendar"
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('ViewConfig', {
                  label: "View Array Object",
                  multiline: true,
                  value: JSON.stringify(defaultview)
                }),
                PropertyPaneTextField('GroupConfig', {
                  label: "Group Array Object",
                  multiline: true,
                  placeholder: JSON.stringify(SampleGroup)
                }),
                PropertyPaneTextField('ItemSize', {
                  label: "Item Size",
                  value: "10"
                }),
                PropertyPaneTextField('DefaultFilter', {
                  label: "Default Filter",
                  placeholder: "Title:test"
                }),
                PropertyPaneTextField('HideSearch', {
                  label: "Hide Search/Pagination",
                  placeholder: "yes/yes"
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
