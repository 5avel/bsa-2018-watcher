﻿using System;
using System.Collections.Generic;
using System.Threading.Tasks;

using DataAccumulator.Shared.Models;

using Watcher.Common.Dtos.Plots;

namespace Watcher.Core.Interfaces
{
    public interface ICollectedDataService
    {
        Task<IEnumerable<CollectedDataDto>> GetAllInstancesInfo();

        Task<MemoryInfo> GetInstanceMemoryInfo(Guid id);

        Task<ProcessesCpuInfo> GetInstanceProcessCpuInfo(Guid id);

        Task<ProcessesRamInfo> GetInstanceProcessRamInfo(Guid id);

        Task<List<PercentageInfo>> GetInstancePercentageInfo(Guid id, int count);

        Task<List<CollectedDataDto>> GetCollectedDataByInstanceId(Guid id, int count);

        Task<List<CollectedDataDto>> GetCollectedDataByInstanceId(Guid id, CollectedDataType dataType);
    }
}
