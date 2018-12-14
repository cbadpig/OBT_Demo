package code.com.obt.demo.test.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("/test")
public class TestController {
    @RequestMapping("/nopage")
    public void test_nopage() {
        System.out.println("1324");
    }

    @RequestMapping("/html")
    public ModelAndView test_htmlpage() {
       return new ModelAndView("test");
    }

}
