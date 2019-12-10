import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export interface IReiCalendarListviewProps {
  description: string;
  ViewConfig:string;     
  GroupConfig:string; 
  HttpClient: SPHttpClient;  
  SiteUrl:string;
  DefaultFilter:string;
  ListName:string; 
  ItemSize:string;
  HideSearch:string;
}
