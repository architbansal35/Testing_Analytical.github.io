var getScriptPromisify = (src) => {
    return new Promise(resolve => {
      $.getScript(src, resolve)
    })
  }
  (function () {
    const prepared = document.createElement('template')
    prepared.innerHTML = `
    
    <head>
    <title>Simple Gantt</title>
    <link href="https://napoleonsecond.github.io/customwidgets/ibmGantt/dist/ibm-gantt-chart.css" rel="stylesheet" />

    <!--  Page styles  -->
    <style>
      html {
        height: 100%;
      }
      body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #gantt {
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="gantt"></div>
    `
    class IBMGantt extends HTMLElement {
      constructor () {

        super();

        this._shadowRoot = this.attachShadow({ mode: 'open' });

        this._shadowRoot.appendChild(prepared.content.cloneNode(true));

        this.isLoaded= false;
  
        this._root = this._shadowRoot.getElementById('root');
        this._chart = this._shadowRoot.getElementById('gantt');
  
        this._props = {};
  
      }

      onCustomWidgetResize (width, height) {
        this.render();
        
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

        
        await getScriptPromisify('https://napoleonsecond.github.io/customwidgets/ibmGantt/dist/ibm-gantt-chart.js');
        
        
        var dataVals = [];

        if (this.data != undefined){
          console.log("Data exists");
          var listOfCat = [];

          for (let index = 0; index < this.data.length; index++){         
            var originalStartTime = this.data[index]["START_TIME"];
            var originalEndTime = this.data[index]["END_TIME"];

            var startDate = new Date(this.data[index]["START_DATE"]);
            var endDate = new Date(this.data[index]["END_DATE"]);

            const startTime = originalStartTime.split(":");
            const endTime = originalEndTime.split(":");

            startDate.setHours(startTime[0]);
            startDate.setMinutes(startTime[1]);
            startDate.setSeconds(startTime[2]);
            startDate.setMilliseconds(0);


            endDate.setHours(endTime[0]);
            endDate.setMinutes(endTime[1]);
            endDate.setSeconds(endTime[2]);
            endDate.setMilliseconds(0);

            var category = this.data[index]["ZBUS_CAT"];

            
            var valid = originalEndTime != "@NullMember" && originalStartTime != "@NullMember" && this.data[index]["START_DATE"] != "@NullMember" && this.data[index]["END_DATE"] != "@NullMember" && this.data[index]["END_DATE"] != " " && this.data[index]["END_DATE"] != "";

            
            if(originalStartTime != NaN && this.data[index]["VARIANTE"] != "" && valid){
                var status = this.data[index]["STATUS"];

                if(listOfCat.indexOf(category) === -1){
                  listOfCat.push(category);
                  dataVals.push(
                    {
                      id: category.concat("_ID"),
                      name: category,
                    }
                  );
                }

                dataVals.push(
                  {
                    id: "TaskNum".concat("+",index.toString()),
                    name: this.data[index]["VARIANTE"],
                    parent: category.concat("_ID"),
                    activities: [
                      {
                      id: index.toString().concat("+", "id"),
                      name: this.data[index]["VARIANTE"].concat("+","Task"),
                      start: Date.parse(startDate.toISOString()),
                      end:  Date.parse(endDate.toISOString()),
                      },
                    ],
                  }
                )
              
              
            } 
          }
          
          var config = {
            data: {
              // Configures how to fetch resources for the Gantt
              resources: {
                data: dataVals, // resources are provided in an array. Instead, we could configure a request to the server.
                // Activities of the resources are provided along with the 'activities' property of resource objects.
                // Alternatively, they could be listed from the 'data.activities' configuration.
                activities: 'activities',
                name: 'name', // The name of the resource is provided with the name property of the resource object.
                id: 'id', // The id of the resource is provided with the id property of the resource object.
                parent: 'parent',
              },
              // Configures how to fetch activities for the Gantt
              // As activities are provided along with the resources, this section only describes how to create
              // activity Gantt properties from the activity model objects.
              activities: {
                start: 'start', // The start of the activity is provided with the start property of the model object
                end: 'end', // The end of the activity is provided with the end property of the model object
                name: 'name', // The name of the activity is provided with the name property of the model object
              },
            },
            // Configure a toolbar associated with the Gantt
            toolbar: [
              'title',
              'search',
              'separator',
              {
                type: 'button',
                text: 'Refresh',
                fontIcon: 'fa fa-refresh fa-lg',
                onclick: function(ctx) {
                  ctx.gantt.draw();
                },
              },
              'fitToContent',
              'zoomIn',
              'zoomOut',
            ],
            title: 'Simple Gantt', // Title for the Gantt to be displayed in the toolbar
          };
          new Gantt(this._chart /* the id of the DOM element to contain the Gantt chart */, config);
        }

        console.log(dataVals);
        
      
        
      }

    }
    customElements.define('com-sap-sample-ibm-gantt', IBMGantt)
  })()