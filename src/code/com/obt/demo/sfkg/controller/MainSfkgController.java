package code.com.obt.demo.sfkg.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("/sfkg")
public class MainSfkgController {

    @RequestMapping({"","/","/shouye","/shouye/"})
    public ModelAndView shouye() {
        return new ModelAndView("sfkg_shouye");
    }

    @RequestMapping({"/exam","/exam/"})
    public ModelAndView login() {
        return new ModelAndView("sfkg_login");
    }
}
