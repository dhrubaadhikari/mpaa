import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
export interface IReicalendarProps {
  description: string;
  StartDate: string;
  EndDate: string;
  Title: string;
  Url: string;
  SiteUrl:string;
  ListName:string;  
  HttpClient: SPHttpClient;
  Filter: string;
  Tag: string;
}
