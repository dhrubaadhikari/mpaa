import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'FactsheetDetailWebPartStrings';
import FactsheetDetail from './components/FactsheetDetail';
import { IFactsheetDetailProps } from './components/IFactsheetDetailProps';

export interface IFactsheetDetailWebPartProps {
  description: string;  
  SiteUrl:string;
  ListName:string;
  ViewConfig:string;  
  Color:string;
  EditUrl:string;
}

export default class FactsheetDetailWebPart extends BaseClientSideWebPart<IFactsheetDetailWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IFactsheetDetailProps > = React.createElement(
      FactsheetDetail,
      { 
        SiteUrl:this.properties.SiteUrl,
        ListName:this.properties.ListName,
        description: this.properties.description,
        Color: this.properties.Color,
        ViewConfig: this.properties.ViewConfig,                
        HttpClient:this.context.spHttpClient,
        EditUrl:this.properties.EditUrl
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
                PropertyPaneTextField('ViewConfig', {
                  label: "View Array Object",
                  multiline: true
                }),  
                PropertyPaneTextField('ListName', {
                  label: "List Name"
                }), 
                PropertyPaneTextField('Color', {
                  label: "Color"
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('EditUrl', {
                  label: "Edit Url (Optional)",
                  placeholder:"https://mpaa.sharepoint.com/sites/RM/Lists/Master%20Factsheet/DispForm.aspx??ID="
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
