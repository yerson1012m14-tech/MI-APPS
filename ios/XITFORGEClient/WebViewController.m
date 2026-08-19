#import "WebViewController.h"
#import <WebKit/WebKit.h>

static NSString * const XITFORGE_API_BASE = @"https://YOUR-DOMAIN.example";

@implementation WebViewController {
    WKWebView *_webView;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    WKWebViewConfiguration *configuration = [WKWebViewConfiguration new];
    _webView = [[WKWebView alloc] initWithFrame:self.view.bounds configuration:configuration];
    _webView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:_webView];

    NSURL *url = [[NSBundle mainBundle] URLForResource:@"ui" withExtension:@"html"];
    if (!url) return;
    NSString *html = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil];
    if (!html) return;
    NSString *base = [NSString stringWithFormat:@"%@/", XITFORGE_API_BASE];
    [_webView loadHTMLString:html baseURL:[NSURL URLWithString:base]];
}
@end
