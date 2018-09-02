import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfirmationService} from 'primeng/primeng';
import {MenuItem, MessageService} from 'primeng/api';
import {DashboardService} from '../../core/services/dashboard.service';
import {Dashboard} from '../../shared/models/dashboard.model';
import {ToastrService} from '../../core/services/toastr.service';
import {DashboardMenuItem} from '../models';
import {DashboardRequest} from '../../shared/models/dashboard-request.model';
import {ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';
import {InstanceService} from '../../core/services/instance.service';
import {DashboardsHub} from '../../core/hubs/dashboards.hub';
import {PercentageInfo} from '../models/percentage-info';
import { AuthService } from '../../core/services/auth.service';
import {CustomChart, CustomChartType, CustomData} from '../charts/models';
import {DataService} from '../services/data.service';
import {ChartService} from '../../core/services/chart.service';
import {CollectedDataService} from '../../core/services/collected-data.service';
import {CollectedData} from '../../shared/models/collected-data.model';
import {defaultOptions} from '../charts/models/chart-options';
import {DashboardChart} from '../models/dashboard-chart';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass'],
  providers: [ToastrService, ConfirmationService, DashboardService, MessageService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private paramsSubscription: Subscription;
  private instanceGuidId: string;

  instanceId: number;
  dashboards: Dashboard[] = [];
  dashboardMenuItems: DashboardMenuItem[] = [];
  activeDashboardItem: DashboardMenuItem = {};

  editTitle: string;
  creation: boolean;
  loading = false;
  displayEditDashboard = false;
  collectedDataForChart: CollectedData[] = [];
  percentageInfoToDisplay: PercentageInfo[] = [];
  percentageInfoToDisplaySingle: PercentageInfo;
  cogItems: MenuItem[];

  displayEditChart = false;
  editChartTitle: string;

  set PercentageInfoToDisplay(info: PercentageInfo[]) {
    this.percentageInfoToDisplay = info;
  }

  set PercentageInfoToDisplaySingle(info: PercentageInfo) {
    this.percentageInfoToDisplaySingle = info;
  }

  chartToEdit = {...defaultOptions};

  constructor(private dashboardsService: DashboardService,
              private collectedDataService: CollectedDataService,
              private instanceService: InstanceService,
              private dashboardsHub: DashboardsHub,
              private toastrService: ToastrService,
              private activateRoute: ActivatedRoute,
              private authService: AuthService,
              private chartService: ChartService,
              private fb: FormBuilder,
              private ngZone: NgZone,
              private dataService: DataService) {
  }

  async ngOnInit(): Promise<void> {
    this.collectedDataService.getBuilderData()
      .subscribe(value => {
        this.collectedDataForChart = value;
      });

    this.instanceService.instanceRemoved.subscribe(instance => this.onInstanceRemoved(instance));
    this.authService.getTokens().subscribe( async ([firebaseToken, watcherToken]) => {
      await this.dashboardsHub.connectToSignalR(firebaseToken, watcherToken);
    });

    this.paramsSubscription = this.activateRoute.params.subscribe(params => {
      if (this.instanceGuidId) {
        this.dashboardsHub.unSubscribeFromInstanceById(this.instanceGuidId);
      }

      this.instanceId = params.insId;
      this.instanceGuidId = params.guidId;
      this.dashboardMenuItems = [];
      if (!this.instanceId) {
        return;
      }

      this.getDashboardsByInstanceId(this.instanceId);
      this.collectedDataService.getInitialPercentageInfoByInstanceId(this.instanceId)
        .subscribe(info => {
          if (info && info.length > 0) {
            this.PercentageInfoToDisplaySingle = info[info.length - 1];
            this.PercentageInfoToDisplay = info;
            // for (let i = 0; i < this.dashboardMenuItems.length; i++) {
            //   for (let j = 0; j < this.dashboardMenuItems.length; j++) {
            //     this.dashboardMenuItems[i].charts[j].data = this.dataService.prepareData(
            //       this.dashboardMenuItems[i].charts[j].chartType.type, this.dashboardMenuItems[i].charts[j].dataSources, info);
            //   }
            // }
          }
          this.dashboardsHub.subscribeToInstanceById(this.instanceGuidId);
        }, err => {
          console.error(err);
          this.toastrService.error('Error occured while fetching instance\'s collected Data');
        });
    });

    this.subscribeToCollectedData();

    this.cogItems = [{
      label: 'Add item',
      icon: 'fa fa-fw fa-plus',
      command: (event?: any) => this.showPopupAddChart(),
    },
      {
        label: 'Edit',
        icon: 'fa fa-fw fa-edit',
        command: (event?: any) => this.showCreatePopup(false),
      },
      {
        label: 'Delete',
        icon: 'fa fa-fw fa-remove',
        command: (event?: any) => this.delete(),
      }
    ];
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }

  subscribeToCollectedData(): void {
    this.dashboardsHub.infoSubObservable.subscribe((latestData: CollectedData) => {
      this.collectedDataForChart.push(latestData); // TODO: check current array on size to remove super old useless data elements
      // TODO: use this operation only for current dashboard and then on switching dashboard make data preparing on existing
      // collectedDataForChart to reduce amount of operations and time
      for (let i = 0; i < this.dashboardMenuItems.length; i++) {
        for (let j = 0; j < this.dashboardMenuItems[i].charts.length; j++) {
          const tempData = this.dataService.prepareDataTick(this.dashboardMenuItems[i].charts[j], latestData);
          this.dashboardMenuItems[i].charts[j].data = tempData;
          // this.dataService.prepareData(
            // this.dashboardMenuItems[i].charts[j].chartType.type, this.dashboardMenuItems[i].charts[j].dataSources, info);
        }
      }
      // const infoToInsert = this.toSeriesData(latestData);
      // for (let i = 0; i < 3; i++) {
      //   if (this.data[i].series > 20) {
      //     this.data[i].series.shift();
      //   }
      //   this.data[i].series.push(infoToInsert[i]);
      // }
      //
      // this.data = [...this.data];
    });
  }

  getDashboardsByInstanceId(id: number): void {
    this.loading = true;
    const plusItem = this.createPlusItem();
    this.dashboardMenuItems.push(plusItem);
    this.dashboardsService.getAllByInstance(id)
      .subscribe((value) => {
        if (value && value.length > 0) {
          this.dashboards = value;
          // Fill Dashboard Menu Items
          this.dashboardMenuItems.unshift(...this.dashboards.map(dash => this.transformToMenuItem(dash)));
          this.activeDashboardItem = this.dashboardMenuItems[0];
        }
        this.loading = false;
        this.toastrService.success('Successfully got instance info from server');
      }, error => this.toastrService.error(error.toString()));
  }

  createPlusItem(): DashboardMenuItem {
    const lastItem: DashboardMenuItem = {
      icon: 'fa fa-plus',
      command: (onlick) => {
        this.activeDashboardItem = lastItem;
        this.showCreatePopup(true);
      },
      id: 'lastTab'
    };

    return lastItem;
  }

  createDashboard(newDashboard: DashboardRequest): void {
    this.dashboardsService.create(newDashboard)
      .subscribe((dto) => {
          const item: DashboardMenuItem = this.transformToMenuItem(dto);
          this.dashboardMenuItems.unshift(item);
          this.activeDashboardItem = this.dashboardMenuItems[0];
          this.loading = false;
          this.toastrService.success('Successfully added new dashboard!');
        },
        error => {
          this.loading = false;
          this.toastrService.error(`Error occurred status: ${error}`);
        });
  }

  updateDashboard(editTitle: string): void {
    const index = this.dashboardMenuItems.findIndex(d => d === this.activeDashboardItem);
    const request: DashboardRequest = {
      title: editTitle,
      instanceId: this.instanceId
    };

    this.dashboardsService.update(this.dashboardMenuItems[index].dashId, request)
      .subscribe(
        (res: Response) => {
          console.log(res);
          this.dashboardMenuItems[index].label = editTitle;
          this.loading = false;
          this.toastrService.success('Successfully updated dashboard!');
        },
        error => {
          this.loading = false;
          this.toastrService.error(`Error occurred status: ${error}`);
        });
  }

  deleteDashboard(dashboard: DashboardMenuItem): void {
    this.dashboardsService.delete(dashboard.dashId)
      .subscribe((res: Response) => {
          console.log(res);
          // Search and delete selected Item
          const index = this.dashboardMenuItems.findIndex(d => d === this.activeDashboardItem);
          this.dashboardMenuItems.splice(index, 1);

          // [0] - is + button
          if (this.dashboardMenuItems.length > 1) {
            this.activeDashboardItem = this.dashboardMenuItems[0];
          } else {
            this.activeDashboardItem = null;
          }

          this.loading = false;
          this.toastrService.success('Successfully deleted dashboard!');
        },
        error => {
          this.loading = false;
          this.toastrService.error(`Error occurred status: ${error}`);
        });
  }

  async delete(): Promise<void> {
    if (await this.toastrService.confirm('You sure you want to delete dashboard ?')) {
      this.loading = true;
      this.deleteDashboard(this.activeDashboardItem);
    }
  }

  showCreatePopup(creation: boolean): void {
    this.creation = creation;
    this.editTitle = creation ? '' : this.activeDashboardItem.label;
    this.displayEditDashboard = true;
  }

  onEdited(title: string) {
    this.loading = true;
    if (this.creation === true) {
      const newdash: DashboardRequest = {title: title, instanceId: this.instanceId};
      this.createDashboard(newdash);
      let index = 0;
      // switching to new tab
      if (this.dashboardMenuItems.length >= 2) {
        index = this.dashboardMenuItems.length - 2;
        this.activeDashboardItem = this.dashboardMenuItems[index];
      }
    } else {
      this.updateDashboard(title);
    }
    this.creation = false;
    this.displayEditDashboard = false;
  }

  onClosed() {
    if (this.creation === true) {
      if (this.dashboardMenuItems.length > 1) {
        // switching to last dashboard if popup is closed without save
        const index = this.dashboardMenuItems.length - 2;
        const label = this.dashboardMenuItems[index].label.slice();

        this.dashboardMenuItems[index] = {
          label: label,
          dashId: this.dashboardMenuItems[index].dashId,
          createdAt: this.dashboardMenuItems[index].createdAt,
          charts: this.dashboardMenuItems[index].charts,
          command: this.dashboardMenuItems[index].command
        };
        this.activeDashboardItem = this.dashboardMenuItems[index];
      } else {
        this.activeDashboardItem = undefined;
      }
    }
    this.creation = false;
    this.displayEditDashboard = false;
  }

  onChartEditClosed() {
    console.log('Edit chart window was closed');
    this.displayEditChart = false;
  }

  showPopupAddChart() {
    this.displayEditChart = true;
  }

  onChartEdited(chart?: DashboardChart) {
    chart.data = this.dataService.prepareData(chart.chartType.type, chart.dataSources, this.collectedDataForChart);
    this.activeDashboardItem.charts.push(chart);
    // this.toastrService.success('Successfully update chart!');
  }


  transformToMenuItem(dashboard: Dashboard): DashboardMenuItem {
    const item: DashboardMenuItem = {
      label: dashboard.title,
      dashId: dashboard.id,
      createdAt: dashboard.createdAt,
      charts: dashboard.charts.map(c => this.dataService.instantiateDashboardChart(c, this.collectedDataForChart)),
      // routerLink: `/user/instances/${this.instanceId}/${this.instanceGuidId}/dashboards/${dashboard.id}`,
      command: (onclick) => {
        this.activeDashboardItem = item;
      }
    };
    return item;
  }

  onInstanceRemoved(id: number) {
    this.instanceId = 0;
    this.dashboards = [];
    this.dashboardMenuItems = [];
    this.activeDashboardItem = null;
  }
}
