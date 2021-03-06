﻿using System.Collections.Generic;
using Watcher.Common.Enums;
using Watcher.Common.Interfaces.Entities;
using Watcher.Common.MoveToFrontend;

namespace Watcher.Common.Dtos
{
    [ExportClassToTypescript]
    public class ChatDto : IEntity<int>
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int UnreadMessagesCount { get; set; }
        
        public ChatType Type { get; set; }

        public string CreatedById { get; set; }
        
        public OrganizationDto Organization { get; set; }

        public IList<MessageDto> Messages { get; set; }

        public IList<UserDto> Users { get; set; }

        public IList<NotificationSettingDto> UsersSettings { get; set; }
    }
}
