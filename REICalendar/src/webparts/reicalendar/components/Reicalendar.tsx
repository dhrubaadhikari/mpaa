import * as React from 'react';
import styles from './Reicalendar.module.scss';
import { IReicalendarProps } from './IReicalendarProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import * as moment from 'moment';
import events from '../Helper/events.js';
//import Modal from '../Helper/Modal';
import { SPHttpClient, SPHttpClientConfiguration, SPHttpClientResponse, ODataVersion, ISPHttpClientConfiguration } from '@microsoft/sp-http';
require('react-big-calendar/lib/css/react-big-calendar.css');

const localizer = momentLocalizer(moment);
let allViews = Object.keys(Views).map(k => Views[k]);

const ColoredDateCellWrapper = ({ children }) =>
  React.cloneElement(React.Children.only(children), {
    style: {
      backgroundColor: 'lightblue',
    },
  });

export default class Reicalendar extends React.Component<IReicalendarProps, any> {
  private tags: Array<myTag>;
  private andFilters: Array<myFilter>;
  private orFilters: Array<myFilter>;
  constructor(args) {
    super(args);

    this.state = {
      events: events,
      event: {},
      showDialog: false,
      data: [],
      listItemCount: 0,
      tags: []
    };

    if (this.props.SiteUrl) {
      this.GetTags();
      this.GetFilters();
      //this.RefreshData();
    }
    else {
      this.setState({ events: events });
    }
  }
  private handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title)
      this.setState({
        events: [
          this.state.events,
          {
            start,
            end,
            title,
          },
        ],
      });
  }

  public Mevent({ event }) {
    return (
      <span>
        <strong>{event.title}</strong>
        {event.desc && ':  ' + event.mytag}
      </span>
    )
  }
  
  public EventAgenda({ event }) {
    return (
      <span>
        <em style={{ color: '#333333' }}>{event.title}</em>
        <p>{event.desc}</p>
      </span>
    )
  }
  private eventStyleGetter(event, start, end, isSelected) {
    //console.log(event);
    var backgroundColor = event.color;
    var style = {
      backgroundColor: backgroundColor,
      borderRadius: '0px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  }

  public Event({ event }) {
    return (
      <span style={{ color: event.color }}>
        <strong>{event.title}</strong>
        {event.desc && ':  ' + event.desc}
      </span>
    );
  }

  public MyCalendar = props => (
    <div>
      <Calendar
        selectable
        events={this.state.data}
        views={allViews}
        style={{ height: '500px'}}
        step={60}
        showMultiDayTimes
        defaultDate={new Date()}
        localizer={localizer}
        onSelectEvent={ev => this.GoToEditItemUrl(ev)}
        onSelectSlot={ev => this.GoToNewItemUrl()}
        eventPropGetter={(this.eventStyleGetter)}
        components={{
          event: this.Mevent,          
          timeSlotWrapper: ColoredDateCellWrapper,
          agenda: {
            event: this.EventAgenda,
          },
        }}
      />
    </div>
  )

  public GoToNewItemUrl() {
    window.open(this.props.SiteUrl + "/Lists/" + this.props.ListName + "/NewForm.aspx?Source="+window.location.href,'_self');
  }

  public GoToEditItemUrl(event) {
    window.open(this.props.SiteUrl + "/Lists/" + this.props.ListName + "/DispForm.aspx?ID=" + event.id+"&Source="+window.location.href,'_self');
  }

  public render(): React.ReactElement<IReicalendarProps> {
    return (
      <div className={styles.container}>
        <this.MyCalendar />
        <this.ShowTagColors props={this} />
      </div>
    );
  }

  public ShowTagColors(props) {
    if (props.props.tags && props.props.tags.length > 0) {
      return (<div className={styles.divpartag}><strong>Tags: </strong>{
        props.props.tags.map(x => props.props.renderTagDiv(x))}
      </div>
      );
    }
    return (<div></div>);
  }

  public renderTagDiv(tag) {
    return (<div className={styles.divtag} style={{ backgroundColor: tag.color }}><strong>{tag.value}</strong></div>);
  }

  public GetListItems() {
    let requestUrl = this.props.SiteUrl.concat("/_api/web/Lists/GetByTitle('" + this.props.ListName + "')/items?$top=5000");
    this.props.HttpClient.get(requestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          response.json().then((responseJSON) => {
            if (responseJSON != null && responseJSON.value != null) {
              var myItems = this.MapListItemToCalendarItem(responseJSON.value);
              //this.setState({ data: myItems });
              this.setStateData(myItems);
              // localStorage.setItem("data", JSON.stringify(responseJSON.value));
              // localStorage.setItem("storageTime", JSON.stringify(new Date()));
            }
          });
        }
      });
  }

  private setStateData(myData) {
    this.setState({ data: myData });
  }

  public componentWillMount() {
    // console.log("componentWillMount called");
    if (this.props.SiteUrl) {
      this.RefreshData();
    }
  }

  public componentDidMount() {
    // console.log("componentDidMount called");
  }

  private RefreshData() {
    // var storageTime = localStorage.getItem("storageTime");
    // var data = localStorage.getItem("data") != "null" ? JSON.parse(localStorage.getItem("data")) : null;
    // var then = storageTime != "null" ? moment(JSON.parse(storageTime)) : moment(new Date());
    // var minutesPassed = storageTime != "null" ? moment().diff(then, 'minutes') : 10;
    // if (minutesPassed > 9)
    //   this.GetListItems();
    // else if (data)
    //   this.setStateData(this.MapListItemToCalendarItem(data));
    // else
      this.GetListItems();

  }

  public MapListItemToCalendarItem(items) {
    return items.filter(n => this.passFilter(n)).map(n => this.maptocal(n, this.props, this.tags));
  }

  public GetTags() {
    if (this.props.Tag)
      this.tags = this.props.Tag.split(',').map(n => new myTag(n));
  }
  public GetFilters() {
    var andFilters = this.props.Filter.split('#');
    var orFilters = [];
    for (var i = 0; i < andFilters.length; i++) {
      //IF IT CONTAINS OR OPERATOR FIND AND ADD IT TO THE OR FILTER LIST
      if (andFilters[i].indexOf('|') > -1) {
        var temp = andFilters[i].split('|');
        if (temp.length > 0) {
          andFilters[i] = temp[0];
          for (var j = 1; j < temp.length; j++)
            orFilters.push(temp[j]);
        }
      }

    }
    this.andFilters = andFilters.map(n => new myFilter(n));
    this.orFilters = orFilters.map(n => new myFilter(n));
  }

  public passFilter(item) {

    for (var i = 0; i < this.orFilters.length; i++) {
      console.log("Or filter run times: " + i);
      if (Array.isArray(item[this.orFilters[i].field])) {
        if (this.IfArrayHasValue(item[this.orFilters[i].field], this.orFilters[i].value))
          return true;
      }
      else if (item[this.orFilters[i].field] == this.orFilters[i].value)
        return true;
    }
    for (var j = 0; j < this.andFilters.length; j++) {
      if (Array.isArray(item[this.andFilters[j].field])) {
        if (!this.IfArrayHasValue(item[this.andFilters[j].field], this.andFilters[j].value))
          return false;
      }
      else if (item[this.andFilters[j].field] != this.andFilters[j].value)
        return false;
    }
    return true;
  }

  public IfArrayHasValue(myArray: Array<string>, propertyValue) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i] == propertyValue)
        return true;
    }
    return false;
  }

  public maptocal(it: any, props, tags) {
    return new myObj(it, props, tags);
  }

}

export class myObj {
  private id: string;
  private start: Date;
  private end: Date;
  private title: string;
  private allDay: boolean;
  private color: string;
  private resource: any;
  private mytag:string;
  constructor(arg, props: IReicalendarProps, myTags: Array<myTag>) {
    this.id = arg.ID,
    this.start = new Date(arg[props.StartDate]);
    this.end = new Date(arg[props.EndDate]);  
    this.color = "#90D7FF";
    this.mytag="";
    this.resource = arg;
    if (myTags) {
      for (var i = 0; i < myTags.length; i++) {
        if (arg[myTags[i].fieldName] == myTags[i].value)
        {
          this.color = myTags[i].color;
          this.mytag= myTags[i].value;
        }
          
      }
    }
    this.title = arg[props.Title]+ "\n"+this.prettyDate2(this.end)+" "+this.mytag;     
    this.allDay = arg["fAllDayEvent"];
  }

  private prettyDate2(date) {
    return date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute:'2-digit'
    });
  }
}

export class myTag {
  public value: string;
  public color: string;
  public fieldName: string;
  constructor(tag: string) {
    this.color = "#90D7FF";
    var temp = tag.split('#');
    var temp2 = [];
    if (temp.length > 0) {
      this.color = "#" + temp[1];
      temp2 = temp[0].split(':');
    }
    if (temp2.length > 0) {
      this.fieldName = temp2[0];
      this.value = temp2[1];
    }
  }
}

export class myFilter {
  public field: string;
  public value: string;
  constructor(filter: string) {
    var temp = filter.split(':');
    if (temp.length > 0) {
      this.field = temp[0];
      this.value = temp[1];
    }
  }
}


