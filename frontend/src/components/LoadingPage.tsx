// Copyright 2019 LiveSite authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useState, useEffect } from 'react';

function LoadingPage() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setTick(tick + 1), 500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [tick]);

  const message = 'Loading.' + '.'.repeat(tick % 3);
  return (
    <div className="container">
      <h1 className="my-3">{message}</h1>
    </div>
  );
}

export default LoadingPage;
