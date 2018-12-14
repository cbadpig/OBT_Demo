package code.com.obt.demo.sfzg.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

@RestController
@RequestMapping("/sfzg")
public class MainSfzgController {

    @RequestMapping({"","/","/shouye","/shouye/"})
    public ModelAndView shouyeSfzg() {
        return new ModelAndView("sfzg_shouye");
    }

    @RequestMapping({"/exam","/exam/"})
    public ModelAndView login() {
        return new ModelAndView("sfkg_login");
    }
}
