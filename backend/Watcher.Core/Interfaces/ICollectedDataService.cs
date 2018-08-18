﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Watcher.Common.Dtos;

namespace Watcher.Core.Interfaces
{
    public interface ICollectedDataService
    {
        Task<IEnumerable<CollectedDataDto>> GetAllInstancesInfo();
    }
}
