#import "WebViewController.h"
#import <WebKit/WebKit.h>

static NSString * const XITFORGE_API_BASE = @"https://YOUR-DOMAIN.example";

@implementation WebViewController {
    WKWebView *_webView;
}
- (void)viewDidLoad {
    [super viewDidLoad];
    _webView = [[WKWebView alloc] initWithFrame:self.view.bounds];
    _webView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:_webView];

    NSURL *fileURL = [[NSBundle mainBundle] URLForResource:@"ui" withExtension:@"html"];
    if (!fileURL) return;
    NSString *html = [NSString stringWithContentsOfURL:fileURL encoding:NSUTF8StringEncoding error:nil];
    NSString *base = [NSString stringWithFormat:@"%@/", XITFORGE_API_BASE];
    [_webView loadHTMLString:html baseURL:[NSURL URLWithString:base]];
}
@end
