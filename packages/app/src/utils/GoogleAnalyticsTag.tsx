import Script from 'next/script';

const GoogleAnalyticsTag = () => {
  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-GCLRBTPM0K"
      ></Script>
      <Script id="gtag-script">
        {`window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments)}
        gtag('js', new Date());
        gtag('config', 'G-GCLRBTPM0K');`}
      </Script>
    </>
  );
};

export default GoogleAnalyticsTag;
