﻿
import { ChartType } from './chart-type.enum';
import { DataProperty } from './data-property.enum';

export interface ChartRequest  {
   showCommon: boolean;
   threshold: number;
   mostLoaded: string;
   dashboardId: number;
   schemeType: string;
   showLegend: boolean;
   legendTitle: string;
   gradient: boolean;
   showXAxis: boolean;
   showYAxis: boolean;
   showXAxisLabel: boolean;
   showYAxisLabel: boolean;
   yAxisLabel: string;
   xAxisLabel: string;
   autoScale: boolean;
   showGridLines: boolean;
   rangeFillOpacity: number;
   roundDomains: boolean;
   isTooltipDisabled: boolean;
   isShowSeriesOnHover: boolean;
   title: string;
   type: ChartType;
   sources: DataProperty[];
   isLightTheme: boolean;
}



