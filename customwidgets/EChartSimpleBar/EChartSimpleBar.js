var getScriptPromisify = (src) => {
    console.log("This is the source variable");
    console.log(src);
    return new Promise(resolve => {
      console.log(src);
      $.getScript(src, resolve)
    })
  }
  
  (function () {
    const prepared = document.createElement('template')
    prepared.innerHTML = `
        <style>
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      `
    class simpleBar extends HTMLElement {
      constructor () {
        super()
  
        this._shadowRoot = this.attachShadow({ mode: 'open' })
        this._shadowRoot.appendChild(prepared.content.cloneNode(true))
  
        this._root = this._shadowRoot.getElementById('root')
  
        this._props = {}
  
        this.render()
      }
  
      onCustomWidgetResize (width, height) {
        this.render()
      }
  
      async render () {
        //await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.0.0/echarts.min.js')
        //await getScriptPromisify('https://cdn.bootcdn.net/ajax/libs/echarts/5.3.3/echarts.min.js')
        await getScriptPromisify("https://napoleonsecond.github.io/customwidgets/echarts.min.js")
        const chart = echarts.init(this._root);
        console.log(this.myDataBinding.data);
      
        const dimension = [];
        const value = [];

        this.myDataBinding.data.forEach(element => {
            dimension.push(element["dimensions_0"]["id"]);
            value.push(element["measures_0"]["raw"]);
        });
        const zoomSize = 6;
        chart.on('click', function (params) {
            console.log(dimension[Math.max(params.dataIndex - zoomSize / 2, 0)]);
            chart.dispatchAction({
                type: 'dataZoom',
                startValue: dimension[Math.max(params.dataIndex - zoomSize / 2, 0)],
                endValue: dimension[Math.min(params.dataIndex + zoomSize / 2, value.length - 1)]
        });
        console.log("finished zooming");
        console.log(Math.max(params.dataIndex - zoomSize / 2, 0));
        console.log(Math.min(params.dataIndex + zoomSize / 2, value.length - 1));
        console.log(dimension[Math.max(params.dataIndex - zoomSize / 2, 0)]);
        console.log(dimension[Math.min(params.dataIndex + zoomSize / 2, value.length - 1)]);
    });
        const option = {
          // https://echarts.apache.org/examples/zh/index.html

        
          xAxis: {
            type: 'category',
            axisLabel: { interval: 0, rotate: 45},
            //data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            data : dimension
          },    
          yAxis: {
            type: 'value'
          },
          dataZoom: [
            {
              type: 'inside'
            }
          ],
          series: [
            {
              //data: [120, 200, 150, 80, 70, 110, 130],
              data: value,
              type: 'bar',
              showBackground: true,
              backgroundStyle: {
                color: 'rgba(180, 180, 180, 0.2)'
              }
            }
          ]
        }

        chart.setOption(option)
        
      }
    }
  
    customElements.define('com-sap-sample-echarts-simple-bar', simpleBar)
  })()