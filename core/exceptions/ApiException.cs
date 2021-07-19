﻿using Bit.Core.Models.Response;
using System;

namespace Bit.Core.Exceptions
{
    public class ApiException : Exception
    {
        public ApiException()
            : base("An API error has occurred.")
        { }

        public ApiException(ErrorResponse error)
            : this()
        {
            Error = error;
        }

        public ErrorResponse Error { get; set; }
    }
}
