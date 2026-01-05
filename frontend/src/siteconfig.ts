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

const siteconfig = {
  ui: {
    lang: 'en',
    photoAspectRatio: 9 / 16,
  },
  features: {
    country: false,
    prefecture: false,
    teamPage: false,
    photo: false,
    icon: false,
    firstAc: false,
  },
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY!,
    authDomain: null, // Inferred at run time
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
    databaseURL: null, // Inferred at run time
  },
  misc: {
    googleAnalyticsId: process.env.GA_ID,
  },
};

export default siteconfig;
