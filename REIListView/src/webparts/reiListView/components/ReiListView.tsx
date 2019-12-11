import * as React from 'react';
import styles from './ReiListView.module.scss';
import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";
import { SPHttpClient, SPHttpClientConfiguration, SPHttpClientResponse, ODataVersion, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import { IReiListViewProps } from './IReiListViewProps';
import { escape } from '@microsoft/sp-lodash-subset';

export default class ReiListView extends React.Component<IReiListViewProps, any> {
  private viewConfig = [];
  private groupConfig = [];
  private defaultfilter = [];
  private itemSize = "300";
  private andFilters: Array<myFilter>;
  private orFilters: Array<myFilter>;
  private LinkUrl = "";
  private showFilter = false;
  private tableid = "";
  constructor(args) {
    super(args);
    this.state = {
      data: []
    }


    this.viewConfig = this.props.ViewConfig ? JSON.parse(this.props.ViewConfig) : [];
    this.itemSize = this.props.ItemSize ? this.props.ItemSize : "300";
    this.LinkUrl = this.props.description;
    this.showFilter = this.props.ShowFilter ? true : false;
    this.tableid = "reilistviewtable" + this.props.ListName;
    this.SetFilters();
    this.GetListItems();
  }


  public render(): React.ReactElement<IReiListViewProps> {
    //const lststyle = { "height": this.itemSize + "px", "overflow-y": "scroll" }

    return (
      <div id={this.tableid} className={styles.tablebody}>
        <ListView
          items={this.state.data}
          viewFields={this.viewConfig}
          compact={true}
          selectionMode={SelectionMode.single}
          showFilter={this.props.ShowFilter}
          groupByFields={this.groupConfig} />
      </div>
    );
  }

  public SetFilters() {
    var filters = this.props.DefaultFilter ? this.props.DefaultFilter.split(',') : [];
    var orFilters = [];
    var andFilters = [];
    for (var i = 0; i < filters.length; i++) {
      if (filters[i].indexOf('#') > -1) {
        andFilters.push(filters[i])
      }
      if (filters[i].indexOf('|') > -1) {
        orFilters.push(filters[i])
      }

    }
    this.andFilters = andFilters.map(n => new myFilter(n));
    this.orFilters = orFilters.map(n => new myFilter(n));
  }

  public SortDefault(items) {
    for (var i = 0; i < this.viewConfig.length; i++) {
      var item = this.viewConfig[i];
      if (item["defaultSort"]) {
        if (item["isDate"]) {
          items.sort(function (a, b) {
            a = new Date(a[item["name"]]);
            b = new Date(b[item["name"]]);
            if (item["defaultSort"] == "Desc")
              return a > b ? -1 : 1;
            else
              return a > b ? 1 : -1;
          });
        }
        else {
          items.sort(function (a, b) {
            a = (a[item["name"]]).toLowerCase();
            b = (b[item["name"]]).toLowerCase();
            if (item["defaultSort"] == "Desc")
              return a > b ? -1 : 1;
            else
              return a > b ? 1 : -1;
          });
        }
        return items;
      }
    }
    return items;
  }

  public SearchItems(items) {
    var res = this.SortDefault(items);
    return res.filter(n => this.passFilter(n));
  }

  public passFilter(item) {
    item["ViewUrl"] = this.ViewItemUrl(item.Id);
    if (this.andFilters.length == 0) {
      if (this.orFilters.length == 0) return true;
      for (var j = 0; j < this.orFilters.length; j++) {
        if (item[this.orFilters[j].field].toLowerCase().indexOf(this.orFilters[j].value.toLowerCase()) >= 0) {
          return true;
        }
      }
    }

    //CHECK AND FILTERS
    for (var i = 0; i < this.andFilters.length; i++) {
      if (item[this.andFilters[i].field] && item[this.andFilters[i].field].toLowerCase().indexOf(this.andFilters[i].value.toLowerCase()) >= 0) {
        if (this.orFilters.length == 0) return true;
        for (var j = 0; j < this.orFilters.length; j++) {
          if (item[this.orFilters[j].field].toLowerCase().indexOf(this.orFilters[j].value.toLowerCase()) >= 0) {
            return true;
          }
        }
      }
    }
  }

  private FormatCss() {
    try {
      var selectors = '.ms-List';
      var selectors2 = '.ms-DetailsList';
      var msList, detailsList;


      detailsList = document.getElementById(this.tableid).querySelector(selectors2);
      detailsList.style["overflowX"] = "hidden";
      detailsList.style["height"] = this.itemSize + "px";

      msList = document.getElementById(this.tableid).querySelector(selectors);
      msList.style["overflowY"] = "scroll";
    }
    catch{
      console.log("list not found");
    }
  }

  private ViewItemUrl(id) {
    if (this.LinkUrl)
      return this.LinkUrl + id + "&Source=" + window.location.href;
    else
      return this.props.SiteUrl + "/Lists/" + this.props.ListName + "/DispForm.aspx?ID=" + id + "&Source=" + window.location.href;
  }

  public GetListItems() {
    if (this.props.SiteUrl) {
      let requestUrl = this.props.SiteUrl.concat("/_api/web/Lists/GetByTitle('" + this.props.ListName + "')/items?$top=5000");
      this.props.HttpClient.get(requestUrl, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse) => {
          if (response.ok) {
            response.json().then((responseJSON) => {
              if (responseJSON != null && responseJSON.value != null) {
                var dat = this.SearchItems(responseJSON.value);
                //this.FormatCss();
                this.setState({
                  data: dat
                });


              }
            });
          }
        });
    }
  }

  public MyListHeader(items, viewFields, iconFieldName, compact, selectionMode, showFilter, groupByFields) {
    return <div>
      <table>
        {
          viewFields.map((head) => {
            return <th style={{ width: head.maxWidth }}>{head.displayName}</th>
          })
        }
      </table>
    </div>
  }

}

export class myFilter {
  public field: string;
  public value: string;
  constructor(filter: string) {
    var temp = filter.substr(0, filter.length - 1).split(':');
    if (temp.length > 0) {
      this.field = temp[0];
      this.value = temp[1];
    }
  }
}
