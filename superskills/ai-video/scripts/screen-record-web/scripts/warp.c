// Moves the real macOS cursor. CGWarpMouseCursorPosition is a display-level
// call, so it needs NO Accessibility permission — unlike posting synthetic
// clicks, which do. That is why this only moves the pointer and lets Chrome
// deliver the clicks over CDP.
//   warp X Y                      jump
//   warp X Y glide STEPS STEP_MS  eased glide from wherever the cursor is
#include <ApplicationServices/ApplicationServices.h>
#include <stdlib.h>
#include <unistd.h>
#include <math.h>

int main(int argc, char** argv) {
  if (argc < 3) return 1;
  double x1 = atof(argv[1]), y1 = atof(argv[2]);
  int steps = argc > 4 ? atoi(argv[4]) : 1;
  int ms    = argc > 5 ? atoi(argv[5]) : 0;
  if (argc > 3 && steps > 1) {
    CGEventRef e = CGEventCreate(NULL);
    CGPoint p0 = CGEventGetLocation(e);
    CFRelease(e);
    for (int i = 1; i <= steps; i++) {
      double t = (double)i / steps;
      double s = t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;  // ease in/out
      CGWarpMouseCursorPosition(CGPointMake(p0.x + (x1 - p0.x) * s, p0.y + (y1 - p0.y) * s));
      usleep(ms * 1000);
    }
  } else {
    CGWarpMouseCursorPosition(CGPointMake(x1, y1));
  }
  return 0;
}
