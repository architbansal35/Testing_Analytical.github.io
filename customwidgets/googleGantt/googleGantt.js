var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
    })
  }
  
  (function () {
    const prepared = document.createElement('template')
    prepared.innerHTML = `
        <style>
          #chart_wrapper {
          overflow-x: scroll;
          overflow-y: hidden;
          width: 900px; 
          height: 500px;
        }
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        <div id="chart_wrapper">
            <div id="chart_div"></div>
        </div>
        </div>
      `
    class Googlgantt extends HTMLElement {
      constructor () {
        super();
        this.test = "just a testing string for google calendar";

        this._shadowRoot = this.attachShadow({ mode: 'open' });

        this._shadowRoot.appendChild(prepared.content.cloneNode(true));
  
        this._root = this._shadowRoot.getElementById('root');
        this._chart = this._shadowRoot.getElementById('chart_div');
  
        this._props = {};
  
        this.render();
      }

      daysToMilliseconds = (days) => {
        return days * 24 * 60 * 60 * 1000;
      }

      minutesToMilliSeconds = (minute) => {
        return minute * 60 * 1000;
    }

  
      onCustomWidgetResize (width, height) {
        this.render();
      }

      convertDimensionDateToDate(theDate){
        const prelimArr = theDate.split(".");
        var theDateString = prelimArr[2].substr(2).substr(0,10);
        const theDateArray= theDateString.split("-");
        return theDateArray;
        
      }

      processDateData = (theData) => {
        console.log(theData);
        var dates = [];
        var value = [];
        if(theData !== undefined){
          for (let index = 0; index < theData.length; index++) {
            dates.push(this.convertDimensionDateToDate(theData[index]["dimensions_0"]["id"]));
            value.push(theData[index]["measures_0"]["raw"]);
          }
          console.log("this is dates");
          console.log(dates);
          return [dates,value];
        }
        
      }
      onCustomWidgetBeforeUpdate(changedProperties) {
        this._props = { ...this._props, ...changedProperties };
      }

      onCustomWidgetAfterUpdate(changedProperties) {
        if ("name" in changedProperties) {
          this.name = changedProperties["name"];
        }
        if ("data" in changedProperties) {
          this.data = changedProperties["data"];
        }
        
        this.render();
        console.log("PropertyHasChanged");
        console.log(this.data);
      }
  
      async render () {
        await getScriptPromisify('https://www.gstatic.com/charts/loader.js')
        
        google.charts.load("current", {packages:["gantt"]});
        google.charts.setOnLoadCallback(this.drawChart);
      }

      drawChart = ()=> {
        /*var dateArray = [];
        var valueArray =[];*/
        var data = new google.visualization.DataTable();
        /*
        Different columns:
    
        */
        
        data.addColumn('string', 'Business Categories');
        data.addColumn("string","Descriptor");
        data.addColumn('date', 'Start Date');
        data.addColumn('date', 'End Date');
        data.addColumn('number', 'Duration of Hours');
        data.addColumn('number', 'Percent complete')
        data.addColumn('string', 'Dependencies');

        if (this.data != undefined){
          console.log("Data exists");
          for (let index = 0; index < this.data.length; index++){
            console.log(this.data[index]["START_DATE"]);

            var theStartTime = new Date(this.data[index]["START_DATE"]);
            var theEndTime = new Date(this.data[index]["END_DATE"]);
            
            var originalStartTime = this.data[index]["START_TIME"];
            var originalEndTime = this.data[index]["END_TIME"];

            var originalStartTimeArray = originalStartTime.split(":");
            var originalEndTimeArray = originalEndTime.split(":");

            theStartTime.setHours(originalStartTimeArray[0]);
            theStartTime.setMinutes(originalStartTimeArray[1]);
            theStartTime.setSeconds(originalStartTimeArray[2]);

            theEndTime.setHours(originalEndTimeArray[0]);
            theEndTime.setMinutes(originalEndTimeArray[1]);
            theEndTime.setSeconds(originalEndTimeArray[2]);

            data.addRow(
              [
                index.toString(),
                this.data[index]["VARIANTE"],
                //new Date(this.data[index]["START_DATE"]),
                //new Date(this.data[index]["END_DATE"]),
                theStartTime,
                theEndTime,
                null,
                100,
                null
              ]
            )
          }
        }
        data.addRows([
          ["1",
          "Human Capital Management",
          new Date(2022, 11, 1, 16, 19),
          new Date(2022, 11, 1, 16, 48), 
          this.minutesToMilliSeconds(48-19),
          100, 
          null],
          ["2",
          "INEED",
          new Date(2022, 11, 1, 16, 15),
          new Date(2022, 11, 1, 16, 28), 
          this.minutesToMilliSeconds(28-15),
          100, 
          null]
        ]);
        
        var chart = new google.visualization.Gantt(this._chart);
        var options = {
        height: 1200,
        gantt: {
          //defaultStartDate: new Date(2022, 11, 1),
          trackHeight :20
        },
        };

        

        chart.draw(data, options);
    }
    }
  
    customElements.define('com-sap-sample-google-gantt', Googlgantt)
  })()