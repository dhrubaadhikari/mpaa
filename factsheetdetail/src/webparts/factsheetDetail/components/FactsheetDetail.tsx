import * as React from 'react';
import styles from './FactsheetDetail.module.scss';
import { IFactsheetDetailProps } from './IFactsheetDetailProps';
import { escape, constant } from '@microsoft/sp-lodash-subset';
import { SPHttpClient, SPHttpClientConfiguration, SPHttpClientResponse, ODataVersion, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import { CSVLink, CSVDownload } from 'react-csv';
const editicons: any = require('../images/edit_icon.png');
const printicon: any = require('../images/print_icon.png');
const downicon: any = require('../images/down_icon.png');
const leftfactlabels = {
  "width": "150px",
  //"min-width": "220px",
  //"padding": "15px",
  "padding": "5px 10px",
  "font-weight": "bold",
  "border-top-width": "2px",
  "border-top-style": "solid",
  "border-bottom-width": "2px",
  "border-bottom-style": "solid",
  "border-right-width": "2px",
  "border-right-style": "solid",
  "border-color": "#aaa",
  "vertical-align":"middle",
  "text-align": "left !important"
} as React.CSSProperties;

const rightfactvalues = {
  // "padding": "15px",
  "padding": "5px 10px",
  "border-top-width": "2px",
  "border-top-style": "solid",
  "border-left-width": "2px",
  "border-left-style": "solid",
  "border-bottom-width": "2px",
  "border-bottom-style": "solid",
  "border-color": "#aaa",
  "text-align": "left !important"
} as React.CSSProperties;
export default class FactsheetDetail extends React.Component<IFactsheetDetailProps, any> {
  private viewConfig = [];
  private exportData: any;
  private SiteUrl: string;
  private ListName: string;
  private ListId: string;
  private Color: string;
  private EditUrl: string;

  constructor(args) {
    super(args);
    this.state = {
      data: {}
    }
    var urlParams = new URLSearchParams(window.location.search);
    this.ListId = urlParams.get('myid');
    this.SiteUrl = this.props.SiteUrl ? this.props.SiteUrl : "";
    this.ListName = this.props.ListName ? this.props.ListName : "";
    this.Color = this.props.Color ? this.props.Color : "";
    this.EditUrl = this.props.EditUrl ? this.props.EditUrl : this.SiteUrl + "/Lists/" + this.ListName + "/DispForm.aspx?ID=";

    if (this.props.ViewConfig) {
      //console.log("test");
      try {
        this.viewConfig = JSON.parse(this.props.ViewConfig);
        this.GetListItems(this.ListId);
      } catch (e) {
        this.setSampleView();
      }
    }
  }


  private setSampleView() {

  }

  public printPage() {

    var rowtohide = document.getElementById("headerrow");
    rowtohide.style.display = "none";


    var content;
    content = document.getElementById("factdiv");
    var pr;
    pr = document.getElementById("ifmcontentstoprint");
    var pri = pr.contentWindow;
    pri.document.open();
    pri.document.write(content.innerHTML);
    pri.document.close();
    pri.focus();
    pri.print();
    rowtohide.style.display = "block";
  }

  private exporttable = (function () {
    var uri = 'data:application/vnd.ms-excel;base64,'
      , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table style="width:60%">{table}</table></body></html>'
      , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
      , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
    return function (table, name, contx) {
      if (!table.nodeType) table = document.getElementById(table)
      var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
      window.location.href = uri + base64(format(template, ctx))
    }
  })()



  public render(): React.ReactElement<IFactsheetDetailProps> {
    const csvHeaders = [
      {
        label: 'Label',
        key: 'label'
      },
      {
        label: 'Values',
        key: 'key'
      }
    ]
    let bgstyle = {
      backgroundImage: this.Color ? "radial-gradient(#fff," + this.Color + ")" : "radial-gradient(#fff," + this.state.data["Color"] + ")",
      width: "100%",
      "min-width": "384px",
      "border-bottom-width": "2px",
      "border-bottom-style": "solid",
      "border-color": "#aaa"
    }


    let headerrow = {
      // backgroundColor: this.Color ? "radial-gradient(#fff," + this.Color + ")" : "radial-gradient(#fff," + this.state.data["Color"] + ")", 
      // "font-weight": "bold",
      margin: "10px",
      padding: "10px",
      width: "35%"

    }

    let headerstyle = {
      margin: "10px", padding: "10px", "font-weight": "bolder", "float": "left"
    } as React.CSSProperties;

    let editicon = {
      "margin-top": "14px",
      "cursor": "pointer"
    } as React.CSSProperties;



    return (
      <div>
        <iframe id="ifmcontentstoprint" className={styles.printframe}></iframe>
        <div className={styles.topicon}>
          <img onClick={() => this.exporttable('collfacttable', this.ListName, this)} src={downicon} alt="download-icon" />
          <img onClick={() => this.printPage()} src={printicon} alt="print-icon" />
        </div>
        <div className={styles.factbg} id="factdiv">
          <table style={bgstyle}>
            <tr>
              <td style={headerrow}>
                <img width="166px" src={this.SiteUrl.concat("/siteassets/mpaa-blck.png")} alt="mpaa-Logo" />
              </td>
              <td>
                <h2 style={headerstyle}>
                  {this.state.data.Title}
                </h2>
                <a href={this.EditUrl + this.state.data["Id"]}>
                  <img width="35px" style={editicon} src={editicons} alt="edit-icon" />
                </a>
              </td>
            </tr>
          </table>
          <this.SetView props={this} />
        </div>
      </div>
    );
  }

  private editUrl() {
    window.open(this.SiteUrl + "/Lists/" + this.ListName + "/DispForm.aspx?ID=" + this.state.data["Id"]);
  }

  public GetListItems(listId) {
    listId = listId ? listId : "1";
    let requestUrl = this.SiteUrl + "/_api/web/Lists/GetByTitle('" + this.ListName + "')/items(" + listId + ")";
    this.props.HttpClient.get(requestUrl, SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        if (response.ok) {
          response.json().then((responseJSON) => {
            if (responseJSON != null) {
              this.setExportData(responseJSON);
              this.setState({ data: responseJSON });
            }
          });
        }
      });
  }

  public SetView(props) {
    var bordercolor = props.props.Color ? props.props.Color : props.props.state.data["Color"];
    let bgstyle = {      
      "border-top-width": "1px",
      "border-top-style": "solid",
      "border-top-color": "#aaa",
      "border-right-color": bordercolor,
      "border-left-color": bordercolor,
      backgroundImage: props.props.Color ? "radial-gradient(#fff," + props.props.Color + ")" : "radial-gradient(#fff," + props.props.state.data["Color"] + ")",
      width: "100%"
    }
    let headercell = {
      fontSize: "24px",
      fontWeight: "bolder",
      borderColor: props.props.Color ? props.props.Color : props.props.state.data["Color"],
      backgroundColor: props.props.Color ? props.props.Color : props.props.state.data["Color"],
      textAlign: "center"
    } as React.CSSProperties;
    return (<table id="collfacttable" className={styles.printtable} style={bgstyle}>
      <tr id="headerrow" className={styles.hiddentitle}>
        <td colSpan={2} style={headercell}>
          {props.props.state.data.Title}
        </td>
      </tr>
      {
        props.props.viewConfig.map(x =>
          <tr>
            <td style={leftfactlabels}>{x.label}</td>
            <td style={rightfactvalues}>{props.props.GetHtmlField(props.props.state.data[x.key])}</td>
          </tr>
        )
      }</table>)
  }

  public GetHtmlField(props) {
    if (props && props["Description"]) {
      return <a href={props["Url"]}>{props["Description"]}</a>
    }
    else
      return <span dangerouslySetInnerHTML={{ __html: props }}></span>
  }

  public setExportData(data) {
    this.exportData = [];
    for (var i = 0; i < this.viewConfig.length; i++) {
      var myObj = {
        "label": this.viewConfig[i].label,
        "key": data[this.viewConfig[i].key]
      }
      this.exportData.push(myObj);
    }
  }
}
