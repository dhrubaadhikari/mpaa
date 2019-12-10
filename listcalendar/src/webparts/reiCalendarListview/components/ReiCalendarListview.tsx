import * as React from 'react';
import styles from './ReiCalendarListview.module.scss';
import events from '../Helper/events.js';
import { IReiCalendarListviewProps } from './IReiCalendarListviewProps';
import { escape } from '@microsoft/sp-lodash-subset';
import * as moment from 'moment';
import { ListView, IViewField, SelectionMode, GroupOrder, IGrouping } from "@pnp/spfx-controls-react/lib/ListView";
import { SPHttpClient, SPHttpClientConfiguration, SPHttpClientResponse, ODataVersion, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode, Selection, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
const exampleChildClass = mergeStyles({
  display: 'block',
  marginBottom: '10px'
});

export interface IDetailsListBasicExampleItem {
  key: number;
  name: string;
  value: number;
}

export interface IDetailsListBasicExampleState {
  items: IDetailsListBasicExampleItem[];
  selectionDetails: {};
}


export default class ReiCalendarListview extends React.Component<IReiCalendarListviewProps, any> {

  private viewConfig = [];
  private viewConfigAll = [];
  private groupConfig = [];
  private items = [];
  private defaultfilter = [];
  private itemSize = 10;
  private andFilters: Array<myFilter>;
  private orFilters: Array<myFilter>;
  private HideSearch=false;
  private HidePagination=false;

  constructor(args) {
    super(args);
    this.state = {
      data: [],
      pagedData: [],
      pageStart: 0,
      hasNext: false,
      hasPrevious: false,
      totalPages: 0,
      currentPage: 0
    }

    if (this.props.HideSearch) {
      var temp = this.props.HideSearch.split('/');
      this.HideSearch = temp[0]?true:false;
      this.HidePagination = temp.length > 1 ? true : false;
    }

    if (this.props.ItemSize)
      this.itemSize = parseInt(this.props.ItemSize);

    if (this.props.ViewConfig) {
      try {
        this.viewConfigAll = JSON.parse(this.props.ViewConfig);
      } catch (e) {
        this.setSampleView();
      }
    }
    else
      this.setSampleView();
    if (this.props.GroupConfig) {
      try {
        this.groupConfig = JSON.parse(this.props.GroupConfig);
      } catch (e) {
        //this.setSampleView();
      }
    }
    else
      this.groupConfig = [];
    //this.setSampleView();
    //this.items = this.stripTags(events);
    //this.RefreshData();
    if (this.props.SiteUrl) {
      //this.SetFilters();
      this.GetFilters();
      this.RefreshData();
    }

  }

  private addtextlistener() {
    try {
      var searchbox = document.getElementById("TextField29");
      var selectors = '[id^="TextField"]';
      if (!searchbox) {
        searchbox = document.getElementById(document.getElementById('reicalendarlistviewdiv').querySelector(selectors).id);
      }

      if (searchbox) {
        if (this.HideSearch) {
          searchbox.parentElement.style.display = "none";
        }
        else {
          searchbox.addEventListener("focus", (ev) => this.myonfocus(ev, this));
          searchbox.addEventListener("blur", (ev) => this.myonblur(ev, this));
        }

      }
    }
    catch{
      console.log("textbox not found");
    }
  }

  private myonfocus(ev, scope) {
    if (scope.state.pagedData.length != scope.items.length) {
      this.setState({
        pagedData: scope.items,
        hasPrevious: false,
        hasNext: false
      });
    }
  }

  private myonblur(ev, scope) {
    if (ev.target.defaultValue.length == 0) {
      this.ShowPagination(this.state.currentPage);
    }

  }

  public render(): React.ReactElement<IReiCalendarListviewProps> {
    const groupByFields: IGrouping[] = this.groupConfig;
    const viewFields: IViewField[] = this.viewConfig;

    const nextstyle = { "display": this.state.hasNext&&!this.HidePagination ? "block" : "none" }
    const prevstyle = { "display": this.state.hasPrevious ? "block" : "none" }

    return (
      <div className={styles.tablebody} id="reicalendarlistviewdiv">
        <ListView
          // items={this.state.pagedData}
          items={this.state.pagedData}
          viewFields={viewFields}
          compact={true}
          selectionMode={SelectionMode.single}
          selection={this._getSelection}
          showFilter={true}
          filterPlaceHolder="Search..."
          groupByFields={groupByFields} />
        <div className={styles.divpartag}>
          <button style={prevstyle} onClick={ev => this.goToPrevious()}><strong> {"<<  Previous "}</strong></button>
          <button style={nextstyle} onClick={ev => this.goToNext()}><strong> {" Next >>"}</strong></button>
        </div>
      </div>
    );
  }
  private _getSelection(items: any[]) {
    //console.log('Selected items:', items);
    //window.open("https://mpaa.sharepoint.com/sites/RM/Lists/Distribution Calendar/DispForm.aspx?ID=" + items[0].Id);
  }

  private mysearch(test) {
    console.log(test);
  }

  public SortDefault(items) {
    for (var i = 0; i < this.viewConfigAll.length; i++) {
      var item = this.viewConfigAll[i];
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

  public ShowPagination(pageNumber: number) {
    var startIndex = pageNumber * this.itemSize;
    var endIndex = startIndex + this.itemSize;
    var myDat = this.SortDefault(this.items);
    this.viewConfig = this.RemoveHiddenColumns(this.viewConfigAll);
    myDat = this.items.slice(startIndex, endIndex >= this.state.data.length ? this.state.data.length : endIndex);
    this.setState({
      pagedData: myDat,
      currentPage: pageNumber,
      hasPrevious: startIndex >= this.itemSize,
      hasNext: startIndex + this.itemSize < this.state.data.length
    });
  }

  public goToPrevious() {
    this.ShowPagination(this.state.currentPage - 1);
  }
  public goToNext() {
    this.ShowPagination(this.state.currentPage + 1);
  }

  private setStateData(myData) {
    var dar = this.stripTags(myData);
    this.setState({
      data: dar,
      totalPages: Math.floor(this.items.length / this.itemSize),
      currentPage: 0
    });
    this.items = dar;
    this.ShowPagination(0);
  }

  componentDidMount() {
    this.addtextlistener();
    this.RefreshData();
  }

  public SetFilters() {
    if (this.props.DefaultFilter && this.props.DefaultFilter.indexOf(':') > -1) {
      var fils = this.props.DefaultFilter.split(",");
      for (var fil in fils) {
        if (fils[fil].indexOf(':') > -1) {
          var keyval = fils[fil].split(':');
          this.defaultfilter.push({ "key": keyval[0], "val": keyval[1] });
        }
      }
    }
  }

  public GetFilters() {
    var filters = this.props.DefaultFilter.split(',');
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

  public RemoveHiddenColumns(items) {
    var myitems=[];
    for (var i = 0; i < items.length; i++) {
     var item =  items[i];
      if (!item['isHidden'] || item['isHidden'] != true)
        myitems.push(items[i]);
    }
    return myitems;
  }

  public passFilter(item) {

    item.MyStudios = this.GetStudios(item.Studios);
    //IF NO AND FILTERS CHECK OR FILTERS
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

  public MatchesFilter(myArray: Array<string>, propertyValue) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].toLowerCase().indexOf(propertyValue.toLowerCase()) > -1)
        return true;
    }
    return false;
  }

  public SearchItems(items: any, searchparams: any) {
    return items.filter(n => this.passFilter(n));
  }


  private RefreshData() {
    this.GetListItems();
  }

  private setSampleView() {
    this.viewConfig = [
      {
        name: "Title",
        sorting: true,
        isResizable: true,
        maxWidth: 200,
        displayName: "Title"
      }];
  }

  private stripTags(obj: Array<any>) {
    var regex = /(<([^>]+)>)/ig;
    var myArr = new Array(obj.length);
    for (var x = obj.length - 1; x >= 0; x--) {
      try {
        obj[x].ViewUrl = this.ViewItemUrl(obj[x].Id);
        obj[x].MyStudios = this.GetStudios(obj[x].Studios);
      }
      catch{
        // obj[x].Action_x0020_Required ? obj[x].Action_x0020_Required = obj[x].Action_x0020_Required.replace(regex, "") : obj[x].Action_x0020_Required = "";
        obj[x].ViewUrl = this.ViewItemUrl(obj[x].Id);
        obj[x].MyStudios ? obj[x].MyStudios = this.GetStudios(obj[x].Studios) : "";
      }
      myArr[obj.length - 1 - x] = obj[x];
    }
    return myArr;
  }

  private ViewItemUrl(id) {
    return this.props.SiteUrl + "/Lists/" + this.props.ListName + "/DispForm.aspx?ID=" + id + "&Source=" + window.location.href;
  }

  private GetStudios(studios: Array<string>) {
    var stud = "";
    if (studios) {
      for (var i = 0; i < studios.length; i++) {
        stud += studios[i] + ", "
      }
      if (stud.length > 2)
        stud.slice(stud.length - 2, 1);
    }
    return stud;
  }

  public GetListItems() {
    if (this.props.SiteUrl) {
      let requestUrl = this.props.SiteUrl.concat("/_api/web/Lists/GetByTitle('" + this.props.ListName + "')/items?$top=5000");
      this.props.HttpClient.get(requestUrl, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse) => {
          if (response.ok) {
            response.json().then((responseJSON) => {
              if (responseJSON != null && responseJSON.value != null) {
                // localStorage.setItem("data", JSON.stringify(responseJSON.value));
                // localStorage.setItem("storageTime", JSON.stringify(new Date()));
                var vals = this.SearchItems(responseJSON.value, this.defaultfilter);
                this.setStateData(vals);
              }
            });
          }
        });
    }
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
