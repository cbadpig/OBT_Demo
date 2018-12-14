package code.com.obt.demo.shouyi.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("/shouyi")
public class MainShouyiController {

    @RequestMapping({"","/","/shouye","/shouye/"})
    public ModelAndView shouye() {
        return new ModelAndView("shouyi_shouye");
    }

    @RequestMapping({"/exam","/exam/"})
    public ModelAndView login() {
        return new ModelAndView("sfkg_login");
    }

}
