define([], function () {
    'use strict';

    return {
        //webRoot:'https://www.chdestination.com/', // production web US
        //webRoot:'https://chdtraceweb-hk.azurewebsites.net/', // production web HK
        webRoot: 'http://localhost:63342/chd-portal/', // local host
        //webRoot: 'https://chdtracewebdemo.azurewebsites.net/', // demo site

        // -- apiRoot:'https://link.chdestination.com/', // production api US, not work
        apiRoot: 'https://chdtracelink.azurewebsites.net/', // production api US
        //apiRoot:'https://chdtracelink-hk.azurewebsites.net/', // production api HK
        //apiRoot:'https://chdtracelink-staging.azurewebsites.net/', // staging api
        //apiRoot:'https://chdtracelinkdemo.azurewebsites.net/', // demo api

        appInsightsKey: 'b5491d97-cd4e-4bf2-a61c-a8abb12ef8e8', // us key
        //appInsightsKey: '6791db7f-193c-4370-8c23-763a233b35be', // hk key

        apiUser: 'apiuser',
        apiPassword: 'I^Rf23i!VoV6',
        //apiPassword: '9F*U&fvp7b', // demo
        secretCode: 'T0pS3cr3t',
        provider: 'CHD',
        dateFormat: 'yyyy-mm-dd'
    };

});
