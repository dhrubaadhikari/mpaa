import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'ReiListViewWebPartStrings';
import ReiListView from './components/ReiListView';
import { IReiListViewProps } from './components/IReiListViewProps';

const defaultview =[
  {
     "name":"Title",
     "sorting":true,
     "isResizable":true,
     "maxWidth":315,
     "displayName":"Title",
     "linkPropertyName":"LinkUrl"
  },
  {
     "name":"RM_x0020_REPORT.Description",
     "sorting":true,
     "maxWidth":256,
     "isResizable":true,
     "displayName":"Report",
     "linkPropertyName":"RM_x0020_REPORT.Url"
  }
];

export interface IReiListViewWebPartProps {
  description: string;  
  SiteUrl:string;
  ListName:string;
  ViewConfig:string;  
  GroupConfig:string;  
  ItemSize:string;  
  DefaultFilter:string;
  ShowFilter:string;
}

export default class ReiListViewWebPart extends BaseClientSideWebPart<IReiListViewWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IReiListViewProps > = React.createElement(
      ReiListView,
      {
        SiteUrl:this.properties.SiteUrl,
        ListName:this.properties.ListName,
        description: this.properties.description,
        ViewConfig: this.properties.ViewConfig,
        GroupConfig: this.properties.GroupConfig,            
        HttpClient:this.context.spHttpClient,
        ItemSize:this.properties.ItemSize,
        DefaultFilter:this.properties.DefaultFilter,
        ShowFilter:this.properties.ShowFilter
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
                  label: "Site Url"
                }),
                PropertyPaneTextField('ListName', {
                  label: "List Name"
                }),
                PropertyPaneTextField('description', {
                  label: "Link Url",
                  placeholder:"https://mysite.sharepoint.com/sites/site/Pages/MyPage.aspx?Id="
                }),
                PropertyPaneTextField('ViewConfig', {
                  label: "View Array Object",
                  multiline: true,
                  value:JSON.stringify(defaultview)
                }),        
                PropertyPaneTextField('GroupConfig', {
                  label: "Group Array Object",
                  multiline: true
                }),
                PropertyPaneTextField('ItemSize', {
                  label: "Item Size",
                  value:"350"
                }),
                PropertyPaneTextField('DefaultFilter', {
                  label: "Default Filter"
                }),
                PropertyPaneTextField('ShowFilter', {
                  label: "Show Filter"                  
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
