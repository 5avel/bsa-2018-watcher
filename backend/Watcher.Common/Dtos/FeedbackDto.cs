﻿using System;
using Watcher.Common.MoveToFrontend;

namespace Watcher.Common.Dtos
{
    [ExportClassToTypescript]
    public class FeedbackDto : EntityDto<int>
    {
        public override int Id { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }

        public int UserId { get; set; }
        public UserDto User { get; set; }

        public int? ResponseId { get; set; }
        public ResponseDto Response { get; set; }
    }
}
