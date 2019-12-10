import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export interface IFactsheetDetailProps {
  description: string;  
  HttpClient: SPHttpClient;  
  SiteUrl:string;
  ListName:string; 
  ViewConfig:string;  
  Color:string;
  EditUrl:string;
  iframeOnLoad?: (iframe: any) => void;
}
