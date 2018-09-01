import {Injectable} from '@angular/core';
import {CustomData} from '../charts/models';
import {CollectedData} from '../../shared/models/collected-data.model';
import {NumberSeriesItem, SeriesItem} from '../models/series-item';
import {MultiChartItem} from '../models/multi-chart-item';
import {dataPropertyLables, DataProperty} from '../../shared/models/data-property.enum';
import {ChartType} from '../../shared/models/chart-type.enum';
import {Chart} from '../../shared/models/chart.model';
import {DashboardChart} from '../models/dashboard-chart';
import {customChartTypes} from '../charts/chart-builder/customChartTypes';
import {defaultOptions} from '../charts/models/chart-options';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor() {
  }

  convertStringToArrEnum(sources: string) {
    const array: DataProperty[] = [];
    const arrNumbers = sources.split(',');

    for (let i = 0; i < arrNumbers.length; i++) {
      array.push(+arrNumbers[i]);
    }

    return array;
  }

  instantiateDashboardChart(value: Chart, collData: CollectedData[]): DashboardChart {
    debugger;
    const dataProps = this.convertStringToArrEnum(value.sources);
    const dashChart: DashboardChart = {
      view: [600, 300],
      colorScheme: defaultOptions.colorScheme,
      schemeType: defaultOptions.schemeType,
      showLegend: value.showLegend,
      legendTitle: value.legendTitle,
      gradient: value.gradient,
      showXAxis: value.showXAxis,
      showYAxis: value.showYAxis,
      showXAxisLabel: value.showXAxisLabel,
      showYAxisLabel: value.showYAxisLabel,
      yAxisLabel: value.yAxisLabel,
      xAxisLabel: value.xAxisLabel,
      autoScale: value.autoScale,
      showGridLines: value.showGridLines,
      rangeFillOpacity: value.rangeFillOpacity,
      roundDomains: value.roundDomains,
      tooltipDisabled: value.isTooltipDisabled,
      showSeriesOnHover: value.isShowSeriesOnHover,
      curve: defaultOptions.curve,
      curveClosed: defaultOptions.curveClosed,
      title: value.title,
      dataSources: dataProps,
      data: this.prepareData(value.type, dataProps , collData),
      activeEntries: [],
      chartType: customChartTypes.find(ct => ct.type === value.type),
      theme: value.isLightTheme ? 'light' : 'dark'
    };

    return dashChart;
  }
  // dataSource - property to show on the chart
  prepareData(chartType: ChartType, dataSources: DataProperty[], dataToTransform: CollectedData[]): CustomData[] {
    if (!dataSources || (!chartType && chartType !== ChartType.BarVertical)) {
      return [];
    }
    if (chartType === ChartType.LineChart) {
      return this.mapToMultiData(dataToTransform, dataSources);
    } else {
      return this.mapToSeriesItem(dataToTransform[0], dataSources);
    }
  }

  mapToMultiData(data: CollectedData[], properties: DataProperty[]): MultiChartItem[] {
    const items: MultiChartItem[] = [];
    for (let i = 0; i < properties.length; i++) {
      const item: MultiChartItem = {name: dataPropertyLables[properties[i]], series: []};
      item.series = data.map(p => this.mapToLineChartSeriesItem(p, properties[i]));
      items.push(item);
    }

    return items;
  }

  mapToSeriesItem(data: CollectedData, properties: DataProperty[]): NumberSeriesItem[] {
    const items: NumberSeriesItem[] = [];
    for (let i = 0; i < properties.length; i++) {
      items.push(
        {
          name: dataPropertyLables[properties[i]],
          value: data[DataProperty[properties[i]]]
        });
    }
    return items;
  }

  mapToLineChartSeriesItem(data: CollectedData, property: DataProperty): SeriesItem {
    const seriesItem: SeriesItem = {
      value: data[DataProperty[property]],
      name: new Date(data.time)
    };

    return seriesItem;
  }
}
